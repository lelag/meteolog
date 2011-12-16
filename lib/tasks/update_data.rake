require 'pp'
require 'open-uri'
require 'csv'

namespace :meteo do
  desc "Update the database with new data from meteo france"
  task :load_france => :environment do
    puts "Loading Public Meteo France Data"
    d = HttpDownloader.new()
    csv_data = d.download('http://france.meteofrance.com/generated/integration/csv/obs/obsFrance.csv')
    update_count = 0
    new_count = 0
    csv_opts = {
      :col_sep => ";",
      :headers => :first_row
    }
    CSV.parse(csv_data, csv_opts) do |r|
      station = Station.find_or_create_by_omm_code(r['indicatif OMM'].gsub(/^[0]+/, ''))
      read_at = DateTime.parse(r['echeance'])
      tmp = Reading.where(:station_id => station, :read_at => read_at).first
      if tmp == nil then
        tmp = Reading.new(:station => station, :read_at => read_at)
        new_count+= 1
      else
        update_count+=1
      end
      tmp.temperature = r['temperature'].to_f / 10 
      tmp.weather = r['temps present'].to_i
      tmp.wind_direction = r['direction du vent'].to_i
      tmp.wind_strength = r['force du vent'].to_i
      tmp.pressure = r['pression'].to_i
      tmp.save
    end
    puts "#{update_count} records updated." 
    puts "#{new_count} records added." 
  end

end

class HttpDownloader
  def initialize(headers = {})
    @headers = headers
  end

  def download(uri)
    url = URI.parse(uri)
    http = Net::HTTP.new(url.host, url.port)
    request = Net::HTTP::Get.new(url.request_uri, @headers)
    resp = http.request(request)
    if resp.response['Location']!=nil then
        if resp.response['set-cookie']!= nil then
          cookie = resp.response['set-cookie']
          @headers["Cookie"] = cookie 
        end
        download(resp.response['Location'])
    else
        resp.body
    end
  end
end


