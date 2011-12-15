class CreateStations < ActiveRecord::Migration
  def change
    create_table :stations do |t|
      t.string :name
      t.string :omm_code
      t.float :lat
      t.float :lng

      t.timestamps
    end
  end
end
