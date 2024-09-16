import { ChangeDetectorRef, Component, ElementRef, inject, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { Geolocation, Position } from '@capacitor/geolocation';
// import { Geolocation } from '@ionic-native/geolocation/ngx';
import { environment } from 'src/environments/environment';
import { Platform, ViewDidEnter } from '@ionic/angular';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
// import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewDidEnter, OnDestroy {
  latitude: number | null = null;
  longitude: number | null = null;
  address: string = 'Fetching address...';
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  locationWatch: any;

  constructor(
    private plateform: Platform,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
    // private locationAccuracy: LocationAccuracy
  ) { }

  ionViewDidEnter(): void {
    this.locationPermissions();
  }

  async locationPermissions() {
    try {
      const requestStatus = await Geolocation.requestPermissions();
      if (requestStatus.location != 'granted') {
        alert('Location permission denied');
        this.openSettings(true);
        return;
      } else {
        console.log('Location permission granted');
        this.initializeMap();
        this.startTracking();
      }
    } catch (error) {
      alert(error)
      console.error('Error requesting permissions:', error);
    }
  }

  openSettings(app = false) {
    console.log('open settings...');
    return NativeSettings.open({
      optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices
    });

  }

  async initializeMap() {
    try {
      const coordinates: Position = await Geolocation.getCurrentPosition();
      console.log('coordinates', coordinates)

      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;

      if (this.mapRef && this.mapRef.nativeElement) {
        await this.createMap(coordinates);
        await this.addMarker(coordinates);
      } else {
        console.error('Map reference is not defined');
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }

  async createMap(coordinates: Position) {
    try {
      this.newMap = await GoogleMap.create({
        id: 'my-cool-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.mapAPI,
        config: {
          center: {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude,
          },
          zoom: 18,
        },
      });
    } catch (error) {
      console.error('Error creating map:', error);
    }
  }

  async addMarker(coordinates: Position) {
    try {
      const marker: Marker = {
        coordinate: {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude,
        },
      };
      await this.newMap.addMarker(marker);
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  }

  startTracking() {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 2000,
      maximumAge: 0
    };
    this.locationWatch = Geolocation.watchPosition(options, (position, error) => {
      if (error) {
        console.error('Error watching position:', error);
        return;
      }
      if (position) {
        console.log('tracking: ' + position.coords.latitude + '; ' + position.coords.longitude)
        this.ngZone.run(() => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.cdr.detectChanges();
        });
        if (this.newMap) {
          this.updateMap(position);
        }
      }
    });
  }

  async updateMap(position: Position) {
    try {
      await this.newMap.setCamera({
        animate: true,
        coordinate: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        zoom: 25,
      });


      const marker: Marker = {
        coordinate: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };
      // await this.newMap.addMarker(marker);
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }


  ngOnDestroy() {
    if (this.locationWatch) {
      Geolocation.clearWatch({ id: this.locationWatch });
    }
  }

  async handleSave() {
    if (this.latitude !== null && this.longitude !== null) {
      alert('Saving coordinates:' + this.latitude + '   :' + this.longitude);
    } else {
      console.error('No location data available to save');
    }
  }
}
