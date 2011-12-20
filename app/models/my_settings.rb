class MySettings < Settingslogic
  source "#{Rails.root}/config/my_settings.yml"
  namespace Rails.env
end
