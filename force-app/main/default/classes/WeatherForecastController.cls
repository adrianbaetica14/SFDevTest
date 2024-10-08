public with sharing class WeatherForecastController {

    @AuraEnabled
    public static Object getWeatherForecast(String recordId, Decimal latitude, Decimal longitude){

        if(latitude != null && longitude != null){
            HttpRequest req = new HttpRequest();
            req.setMethod('GET');
            String url = 'https://api.open-meteo.com/v1/forecast?';
            url += 'latitude=' + latitude;
            url += '&longitude=' + longitude;
            url += '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=2';
            req.setEndpoint(url);

            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() == 200) {
                String jsonResponse = res.getBody();
                Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(jsonResponse);
                return parsed.get('daily');
            } else {
                return 'Weather data could not be loaded from the API: '+res.getStatusCode();
            }
        } else{
            return 'Weather data can not be loaded: Location not found';
        }
    }
}