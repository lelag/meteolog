class StationsController < ApplicationController
  # GET /stations
  # GET /stations.json
  def index
    @stations = Station.all

    respond_to do |format|
      format.json { render json: @stations }
    end
  end

  # GET /stations/1
  # GET /stations/1.json
  def show

    if(params['from_date'] && params['to_date'])
      from_date = DateTime.parse(params['from_date'] + '  00:00:00');
      to_date = DateTime.parse(params['to_date'] + ' 23:59:59');
      @readings = Reading.where("read_at > ? and read_at < ? and station_id = ?", from_date, to_date, params[:id]).includes(:station)
    else
      @readings = Reading.where("station_id = ?", params[:id]).includes(:station)
    end


    respond_to do |format|
      format.json { render json: @readings}
    end
  end

end
