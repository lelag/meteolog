class ReadingsController < ApplicationController

  # GET /readings
  # GET /readings.json
  def index
    if(params['from_date'] && params['to_date'])
      from_date = DateTime.parse(params['from_date'] + '  00:00:00');
      to_date = DateTime.parse(params['to_date'] + ' 23:59:59');
      @readings = Reading.where("read_at > ? and read_at < ?", from_date, to_date).includes(:station)
    else
      @readings = Reading.includes(:station).all
    end

    respond_to do |format|
      format.json { 
        temp = {};
        wind_dir = {};
        wind_strength = {}
        pressure = {}
        weather = {}
        @readings.each do |re|
          ts = re.read_at.to_i
          #temperature
          if !temp[ts]
            temp[ts] = {'max' => 30, 'data' => []}
          end
          temp[ts]['data'].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :count => re.temperature
          })
          #wind_dir
          if !wind_dir[ts]
            wind_dir[ts] = [] 
          end
          wind_dir[ts].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :dir => re.wind_direction
          })
          #wind_strength
          if !wind_strength[ts]
            wind_strength[ts] = {'max' => 270, 'data' => []}
          end
          wind_strength[ts]['data'].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :count => re.wind_strength
          })
          #pressure
          if !pressure[ts]
            pressure[ts] = {'max' => 108000, 'data' => []}
          end
          pressure[ts]['data'].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :count => re.pressure
          })
          #weather
          if !weather[ts]
            weather[ts] = [] 
          end
          weather[ts].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :dir => re.weather
          })
        end
        s = {
          :temperature => temp,
          :wind_dir => wind_dir,
          :wind_strength => wind_strength,
          :pressure => pressure,
          :weather => weather
        }
        render json: s
      }
    end
  end

  # GET /readings/1
  # GET /readings/1.json
  def show
    @reading = Reading.find(params[:id])

    respond_to do |format|
      format.json { render json: @reading }
    end
  end
end
