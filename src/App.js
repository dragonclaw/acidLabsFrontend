import React from "react";
import { Map, GoogleApiWrapper, InfoWindow } from "google-maps-react";
import axios from "axios";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCountry: null,
      selectedCountryTemperature: null,
      showingInfoWindow: false,
      position: {}
    };
  }
  //Should abstract the call to a service scaffolding file
  mapClicked = async (mapProps, map, clickEvent) => {
    const positionClicked = {};
    positionClicked.lat = clickEvent.latLng.lat();
    positionClicked.lng = clickEvent.latLng.lng();
    let response = {};
    if (process.env.develop)
      response = await axios.get(
        `http://localhost:8000/getCountryData?lat=${clickEvent.latLng.lat()}&lng=${clickEvent.latLng.lng()}`
      );
    else
      response = await axios.get(
        `http://ec2-52-39-106-8.us-west-2.compute.amazonaws.com:8000/getCountryData?lat=${clickEvent.latLng.lat()}&lng=${clickEvent.latLng.lng()}`
      );
    const dataSelectedGoogle = response.data.dataCountry.find(item =>
      item.types.includes("country")
    );
    this.setState({
      showingInfoWindow: true,
      selectedCountry: dataSelectedGoogle.long_name,
      selectedCountryTemperature: response.data.dataDarkly.temperature,
      position: positionClicked
    });
  };

  mapStyle = [
    {
      stylers: [{ hue: "#00ffe6" }, { saturation: -20 }]
    },
    {
      featureType: "landscape",
      stylers: [{ hue: "#ffff66" }, { saturation: 100 }]
    },
    {
      featureType: "road",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.locality",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.neighborhood",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.province",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "landscape.man_made",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "landscape.natural",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }]
    }
  ];

  _mapLoaded(mapProps, map) {
    map.setOptions({
      styles: this.mapStyle
    });
  }

  render() {
    const mapStyles = {
      width: "100%",
      height: "100%"
    };

    return (
      <Map
        onClick={this.mapClicked}
        google={this.props.google}
        zoom={4}
        style={mapStyles}
        gestureHandling={"cooperative"}
        zoomControl={false}
        initialCenter={{ lat: -27.444, lng: -72.176 }}
        onReady={(mapProps, map) => this._mapLoaded(mapProps, map)}
      >
        <InfoWindow
          visible={true}
          position={{
            lat: this.state.position.lat,
            lng: this.state.position.lng
          }}
        >
          <div>
            <h1>{this.state.selectedCountry}</h1>
            <h2>{this.state.selectedCountryTemperature} F°</h2>
          </div>
        </InfoWindow>
      </Map>
    );
  }
}
//Should be on env file (dev key)
export default GoogleApiWrapper({
  apiKey: process.env.DB_GOOGLE_API_KEY
})(App);
