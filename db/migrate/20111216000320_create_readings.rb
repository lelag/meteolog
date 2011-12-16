class CreateReadings < ActiveRecord::Migration
  def change
    create_table :readings do |t|
      t.datetime :read_at
      t.references :station
      t.float :temperature
      t.integer :weather
      t.integer :wind_direction
      t.integer :wind_strength
      t.integer :pressure

      t.timestamps
    end
    add_index :readings, :station_id
  end
end
