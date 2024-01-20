  // TO MAKE THE MAP APPEAR YOU MUST
        // ADD YOUR ACCESS TOKEN FROM
        // https://account.mapbox.com
        
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  center: coordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
});
const marker = new mapboxgl.Marker({ color: "red", rotation: 45 })
.setLngLat(coordinates)
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML("<p>Exact location will be provided after booking</p>"))
.addTo(map);

