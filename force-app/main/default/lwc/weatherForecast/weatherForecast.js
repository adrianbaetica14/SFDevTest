import { LightningElement, api, wire} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getWeatherForecast from '@salesforce/apex/WeatherForecastController.getWeatherForecast';
import icon from '@salesforce/resourceUrl/weather_codes';

const FIELDS = ['Account.Location__Latitude__s','Account.Location__Longitude__s']

export default class WeatherForecast extends LightningElement {
    @api recordId;
    tomorrowDate;
    minTemp = '-';
    maxTemp = '-';
    weatherIcon;
    weatherText;
    weatherCodes = {
        '0': 'Clear sky',
        '1': 'Mainly clear',
        '2': 'Partly cloudy',
        '3': 'Overcast',
        '4': 'Fog',
        '5': 'Drizzle',
        '6': 'Rain',
        '7': 'Snow fall',
        '8': 'Rain',
        '9': 'Thunderstorm'
    };

    @wire(getRecord, {recordId: '$recordId', fields: FIELDS})
    locationData({error, data}){
            if(error){
                console.log('Error occured in fetching location info: ' + error.body.message);
            } else if(data && this.recordId){
                let latitude = data?.fields?.Location__Latitude__s?.value;
                let longitude = data?.fields?.Location__Longitude__s?.value;
                let recordId = this.recordId;
                getWeatherForecast({recordId, latitude, longitude})
                    .then(response => {
                        if(response && response['time']){
                            this.tomorrowDate = response?.time[1];
                            this.minTemp = response?.temperature_2m_min[1];
                            this.maxTemp = response?.temperature_2m_max[1];
                            let weatherCode = response?.weather_code[1] < 10 ? response?.weather_code[1] : parseInt(response?.weather_code[1]/10);
                            this.weatherIcon = icon + `/${weatherCode}.png`;
                            this.weatherText = this.weatherCodes[weatherCode];
                        } else{
                            this.weatherText = response;
                        }
                    }
                ).catch((error) => {
                     console.log(error);
                     this.dispatchEvent(
                         new ShowToastEvent({
                             title: 'Weather data Error',
                             message: 'Error while loading the weather forecast.',
                             variant: 'error'
                         })
                     );
                });
            }
        };
}