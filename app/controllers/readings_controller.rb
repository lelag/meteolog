class ReadingsController < ApplicationController

  # GET /readings
  # GET /readings.json
  def index
    if(params['from_date'] && params['to_date'])
      from_date = DateTime.parse(params['from_date'] + '  00:00:00');
      to_date = DateTime.parse(params['to_date'] + ' 23:59:59');
      @readings = Reading.where("read_at > ? and read_at < ?", from_date, to_date).includes(:station)

      max_temp = (Reading.where("read_at > ? and read_at < ? and temperature > -50", from_date, to_date).maximum("temperature")*100).round.to_f / 100
      min_temp = (Reading.where("read_at > ? and read_at < ? and temperature > - 50", from_date, to_date).minimum("temperature")*100).round.to_f / 100
      max_wind_strength = Reading.where("read_at > ? and read_at < ? and wind_strength >= 0", from_date, to_date).maximum("wind_strength") / 10
      min_wind_strength = Reading.where("read_at > ? and read_at < ? and wind_strength >= 0", from_date, to_date).minimum("wind_strength") / 10
      max_pressure = Reading.where("read_at > ? and read_at < ? and pressure >= 0", from_date, to_date).maximum("pressure")
      min_pressure = Reading.where("read_at > ? and read_at < ? and pressure >= 0", from_date, to_date).minimum("pressure")
    else
      @readings = Reading.includes(:station).all
      max_temp = (Reading.where("temperature > -50").maximum("temperature")*100).round.to_f / 100
      min_temp = (Reading.where("temperature > - 50").minimum("temperature")*100).round.to_f / 100
      max_wind_strength = Reading.where("wind_strength >= 0").maximum("wind_strength") / 10
      min_wind_strength = Reading.where("wind_strength >= 0").minimum("wind_strength") / 10
      max_pressure = Reading.where("temperature >= 0").maximum("pressure")
      min_pressure = Reading.where("temperature >= 0").minimum("pressure")
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
            temp[ts] = {'max' => (max_temp - min_temp).to_i, 'data' => []}
          end
          temp[ts]['data'].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :count => (re.temperature - min_temp).to_i
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
            wind_strength[ts] = {'max' => max_wind_strength - min_wind_strength, 'data' => []}
          end
          wind_strength[ts]['data'].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :count => (re.wind_strength - min_wind_strength) / 10
          })
          #pressure
          if !pressure[ts]
            pressure[ts] = {'max' => max_pressure - min_pressure, 'data' => []}
          end
          pressure[ts]['data'].push( {
            :lat  => re.station.lat,
            :lon  => re.station.lng,
            :count => re.pressure - min_pressure
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
          :temperature => {:data => temp, :min_max => {:min => min_temp, :max => max_temp}, :unit => "Celsius"},
          :wind_dir => {:data => wind_dir},
          :wind_strength => {:data => wind_strength, :min_max => {:min => min_wind_strength, :max => max_wind_strength}, :unit => "m/s"},
          :pressure=> {:data => pressure, :min_max => {:min => min_pressure, :max => max_pressure}, :unit => "hPa"},
          :weather => {:data => weather}
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
