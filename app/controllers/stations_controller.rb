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
    @station = Station.find(params[:id])

    respond_to do |format|
      format.json { render json: @station }
    end
  end

end
