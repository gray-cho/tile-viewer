'use strict';

// Initializes Editor.
function Editor() {

  this.samplePolygon = "<Polygon><outerBoundaryIs><LinearRing><coordinates>\n" +
    "126.65224962007765,37.44761614008235,0." + "\n" +
    "126.65282705708105,37.44738132261064,0." + "\n" +
    "126.65262224381664,37.44707212493878,0." + "\n" +
    "126.65224577341172,37.44722644202798,0." + "\n" +
    "126.65224962007765,37.44761614008235,0." + "\n" +
    "</coordinates></LinearRing></outerBoundaryIs></Polygon>";


  this.placeName = document.querySelector('#placename');
  this.placeList = document.querySelector('#placesList');
  this.address = document.querySelector('#address');

  this.mapElem = document.querySelector('#map');
  this.polygonBtn = document.querySelector('#polygonBtn');
  this.clearBtn = document.querySelector('#clearBtn');
  this.polygonArea = document.querySelector('#polygonTextArea')

  this.tileSlide = document.querySelector('#resolutionSlide')
  this.tileStatusLabel = document.querySelector('#resolutionLabel')

  this.markers = [];
  this.tags = [];
  this.shapes = [];
  this.geofences = [];
  this.zoomLevel = 18;

  this.drawingFlag = false;
  this.drawingPolygon;
  this.polygon;
  this.areaOverlay;


  this.initOptions()
  // this.polygonArea.value = JSON.stringify(this.samplePolygon, null, '\t');

}

Editor.prototype.initOptions = function() {
  const labels = [
    'grid'
  ]
  this.optionsElem = {};

  const self = this
  labels.forEach((label) => {
    const labelPrefix = 'icon-toggle-'
    let optionToggle = document.getElementById(labelPrefix + label)

    if (optionToggle) {
      this.optionsElem[label] = optionToggle.checked

      optionToggle.addEventListener('click', self.toggleOption.bind(this));
    }
  })

  // variable 셋팅

  this.polygonArea.value = this.samplePolygon;
  this.tileSlide.value = this.zoomLevel;
  this.tileStatusLabel.textContent = this.zoomLevel;

  this.tileSlide.addEventListener('mouseup', this.sliderChanged.bind(this))
}

Editor.prototype.toggleOption = function(e) {
  const labels = [
    'grid'
  ]

  labels.forEach((label) => {
    const labelPrefix = 'icon-toggle-'
    let optionToggle = document.getElementById(labelPrefix + label)

    if (optionToggle) {
      this.optionsElem[label] = optionToggle.checked
    }
  })

  // grid
  if (this.optionsElem[labels[0]]) {
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    this.removeTileMarker();

    this.map.removeListener('click', this.mapClickPolygonListener);
    this.map.removeListener('mousemove', this.mapMovePolygonListener);
    this.map.removeListener('rightclick', this.mapRightPolygonListener);

    this.map.addListener('click', this.mapClickTileListener);
  } else {

    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    this.removeTileMarker();

    this.map.removeListener('click', this.mapClickTileListener);

    this.map.addListener('click', this.mapClickPolygonListener);
    this.map.addListener('mousemove', this.mapMovePolygonListener);
    this.map.addListener('rightclick', this.mapRightPolygonListener);
  }
}

Editor.prototype.sliderChanged = function(e){
  editor.log(this.tileSlide.value);
  this.tileStatusLabel.textContent = this.tileSlide.value;
  this.zoomLevel = this.tileSlide.value;
  //Tile level 조정
  if(this.shapes){
    this.redrawTiles()
  }
  this.drawBoxes();
}


Editor.prototype.setVisibility = function(elements, visible) {
  elements.forEach(function(o) {
    if (visible) {
      o.removeAttribute('hidden');
    } else {
      o.setAttribute('hidden', 'true');
    }
  });
};

Editor.prototype.geocodeLatLng = function(event) {
  this.geocoder.geocode({
    'location': {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }
  }, function(results, status) {
    if (status === daum.maps.GeocoderStatus.OK) {
      if (results[0]) {
        editor.log(results);
        // var location = results[0].geometry.location;
        // this.marker.setPosition({
        //   lat: location.lat(),
        //   lng: location.lng()
        // });
        this.marker.setPosition(new daum.maps.LatLng(results[0].y, results[0].x))

        this.address.value = results[0].address_name;
        // this.infowindow.setContent(results[1].formatted_address);
        // this.infowindow.open(this.map, this.marker);
      } else {
        editor.log('No results found');
      }
    } else {
      console.error('Geocoder failed due to: ' + status);
    }
  }.bind(this));
}

Editor.prototype.initializeMap = function() {

  this.map = new daum.maps.Map(this.mapElem, {
    center: new daum.maps.LatLng(37.481713, 127.0078224),
    level: 6
  })

  this.marker = new daum.maps.Marker({
    map: this.map
  })

  daum.maps.event.addListener(this.map, 'center_changed', this.scrollEvent.bind(this))

  this.initAutocomplete();

  this.tileMarker = new daum.maps.Marker({
    map: this.map
  })
  this.infoWindow = new daum.maps.InfoWindow({
    content: ''
  });

  this.tagWindow = new daum.maps.InfoWindow({
    zIndex: 1
  });

  this.geocoder = new daum.maps.services.Geocoder();


  this.tileMarker.addListener('click', function() {
    this.infoWindow.open(this.map, this.tileMarker)
  }.bind(this))


  this.fetchGeofences()

  this.mapClickTileListener = this.showActiveTile.bind(this)

  this.mapClickPolygonListener = this.clickActivePolygon.bind(this)
  this.mapMovePolygonListener = this.moveActivePolygon.bind(this)
  this.mapRightPolygonListener = this.rightActivePolygon.bind(this)

  this.map.addListener('click', this.mapClickTileListener);

  this.polygonBtn.addEventListener('click', this.createPolygon.bind(this));
  this.clearBtn.addEventListener('click', this.clearPolygon.bind(this));

}

Editor.prototype.showTileInfo = function(lat, lng) {
  this.tileMarker.setPosition(e.latLng)
}

window.addEventListener('load', () => {
  window.editor = new Editor();
  editor.log('Editor has been initialized.')

  window.editor.initializeMap();
});

//
window._initGoogleMap = function() {
  editor.log('Google map has been initialized.')
}

// https://getmdl.io/components/index.html
// https://developers.google.com/maps/documentation/javascript/3.exp/reference#Autocomplete
// https://developers.google.com/places/supported_types#table3
Editor.prototype.initAutocomplete = function() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.

  var defaultBounds = new daum.maps.LatLngBounds(
    new daum.maps.LatLng(32.0722, 124.3544), //
    new daum.maps.LatLng(38.3640, 131.5222) // 마라도/독도
  );

  this.places = new daum.maps.services.Places();

  this.placeName.addEventListener('keydown', this.searchPlaces.bind(this));
}

Editor.prototype.searchPlaces = function(e) {
  if (e.key === 'Enter') {

    this.removeTileMarker();

    this.tileMarker.setMap(this.map);

    var regexpCoord = /-?\d{1,3}\.\d+/gmi;
    var regexpTile = /-?\d{1,6}\,-?\d{1,6}\,\d+/gmi;

    if (regexpCoord.test(this.placeName.value)) {
      this.geocoder.coord2Address(parseFloat(this.placeName.value.split(',')[1]), parseFloat(this.placeName.value.split(',')[0]),
        this.searchDetailAddrFromCoords.bind(this));

    } else if (regexpTile.test(this.placeName.value)) {
      var coord = this.getLocationFromTile(parseInt(this.placeName.value.split(',')[0]), parseInt(this.placeName.value.split(',')[1]),
        parseInt(this.placeName.value.split(',')[2]));
      this.placeName.value = coord[0] + ',' + coord[1];
      this.geocoder.coord2Address(parseFloat(this.placeName.value.split(',')[1]), parseFloat(this.placeName.value.split(',')[0]),
        this.searchDetailAddrFromCoords.bind(this));

    } else {
      this.places.keywordSearch(this.placeName.value, this.fillInAddress.bind(this));
    }
  }
}
Editor.prototype.searchDetailAddrFromCoords = function(result, status) {
  var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
  detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';

  var content = '<div class="bAddr">' +
    '<span class="title">법정동 주소정보</span>' +
    detailAddr +
    '</div>';
  var searchCoordPosition = new daum.maps.LatLng(parseFloat(this.placeName.value.split(',')[0]), parseFloat(this.placeName.value.split(',')[1]));

  this.marker.setPosition(searchCoordPosition);
  this.marker.setMap(this.map);
  this.tagWindow.setContent(content);
  this.tagWindow.open(this.map, this.marker);

  var bounds = new daum.maps.LatLngBounds();
  bounds.extend(searchCoordPosition);

  this.map.setBounds(bounds);

}


Editor.prototype.addPlaceSearchMarker = function(position, idx, title) {
  var imageSrc = 'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
    imageSize = new daum.maps.Size(36, 37),
    imgOptions = {
      spriteSize: new daum.maps.Size(36, 691),
      spriteOrigin: new daum.maps.Point(0, (idx * 46) + 10),
      offset: new daum.maps.Point(13, 37)
    },
    markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imgOptions),
    marker = new daum.maps.Marker({
      position: position,
      image: markerImage
    });

  marker.setMap(this.map);
  this.markers.push(marker);

  return marker;
}

Editor.prototype.removeTileMarker = function() {
  if (this.infoWindow) {
    this.infoWindow.close();
  }

  if (this.clickedTile) {
    this.clickedTile.setMap(null);
  }

  if (this.tileMarker) {
    this.tileMarker.setMap(null);
  }
}

Editor.prototype.removePlaceMarker = function() {

  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(null);
  }
  for (var i = 0; i < this.tags.length; i++) {
    this.tags[i].close();
  }
  this.tagWindow.close();

  this.marker.setMap(null);

  this.markers = [];
  this.tags = [];
}

Editor.prototype.displayInfowindow = function(marker, title) {
  var content = '<ul>' +
    '<li>' + title + '</li>' +
    '<li>' +
    '위경도: ' + marker.getPosition().getLat() + ', ' + marker.getPosition().getLng() +
    '</li>' +
    '</ul>';
  this.tagWindow = new daum.maps.InfoWindow({
    zIndex: 1
  });
  this.tagWindow.setContent(content);
  this.tagWindow.open(this.map, marker);

  this.tags.push(this.tagWindow);
}


Editor.prototype.fillInAddress = function(places, status, pagination) {
  if (status === daum.maps.services.Status.OK) {

    var fragment = document.createDocumentFragment(),
      bounds = new daum.maps.LatLngBounds();
    editor.log('data : ' + places[0].place_name);

    this.removePlaceMarker();

    for (var i = 0; i < places.length; i++) {
      var placePosition = new daum.maps.LatLng(places[i].y, places[i].x),
        marker = this.addPlaceSearchMarker(placePosition, i);
      bounds.extend(placePosition);

      this.displayInfowindow(marker, places[i].place_name);
    }
    this.map.setBounds(bounds)

  } else if (status === daum.maps.services.Status.ZERO_RESULT) {
    alert('검색된 장소가 없습니다.');
    return;
  } else if (status === daum.maps.services.Status.ERROR) {
    alert('검색된 장소가 없습니다.');
    return;
  }

}


Editor.prototype.getGeofencesContains = function(loc) {
  var results = []
  this.geofences.forEach((geofence) => {
    var clickedPosition = new daum.maps.Polyline({
      path: [new daum.maps.LatLng(loc.getLat(), loc.getLng()), geofence.circle.getPosition()],
      strokeWeight: 0,
      strokeOpacity: 0
    });

    var radius = Math.round(clickedPosition.getLength())
    if (radius <= geofence.circle.getRadius()) {
      results.push(geofence)
    }
  })
  return results

}

Editor.prototype.createPolygon = function() {

  // var jsonObj = JSON.parse(this.polygonArea.value).coordinates
  var polygonKML = this.polygonArea.value.replace(/(<([^>]+)>)/gmi, "");
  var pathList = [];

  // jsonObj.forEach((coord) => {
  //   pathList.push(new daum.maps.LatLng(coord[0], coord[1]));
  // })

  var pathArr = polygonKML.split('\n');
  pathArr.forEach((path) => {
    if (path.length > 1) {
      var coords = path.split(',');
      pathList.push(new daum.maps.LatLng(parseFloat(coords[1]), parseFloat(coords[0])));
    }
  })

  if (this.polygon) {
    this.polygon.setMap(null);
    this.polygon = null;
  }

  this.polygon = new daum.maps.Polygon({
    path: pathList,
    strokeWeight: 3,
    strokeColor: '#00a0e9',
    strokeOpacity: 1,
    strokeStyle: 'solid',
    fillColor: '#00a0e9',
    fillOpacity: 0.2
  });

  var area = Math.round(this.polygon.getArea()),
    content = '<div class="info">총면적 <span class="number"> ' + area + '</span> m<sup>2</sup></div>';

  this.areaOverlay = new daum.maps.CustomOverlay({
    map: this.map,
    content: content,
    xAnchor: 0,
    yAnchor: 0,
    position: pathList[pathList.length - 1]
  });


  this.polygon.setMap(this.map);
  var bounds = new daum.maps.LatLngBounds();
  bounds.extend(pathList[0]);

  this.map.setBounds(bounds)

}

Editor.prototype.clearPolygon = function() {
  if (this.polygon) {
    this.polygon.setMap(null);
    this.polygon = null;
  }

  if (this.areaOverlay) {
    this.areaOverlay.setMap(null);
    this.areaOverlay = null;
  }
}


Editor.prototype.clickActivePolygon = function(e) {

  var clickPosition = e.latLng;


  if (!this.drawingFlag) {
    this.drawingFlag = true;

    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }

    if (this.areaOverlay) {
      this.areaOverlay.setMap(null);
      this.areaOverlay = null;
    }

    this.drawingPolygon = new daum.maps.Polygon({
      map: this.map,
      path: [clickPosition],
      strokeWeight: 3,
      strokeColor: '#00a0e9',
      strokeOpacity: 1,
      strokeStyle: 'solid',
      fillColor: '#00a0e9',
      fillOpacity: 0.2
    });

    this.polygon = new daum.maps.Polygon({
      path: [clickPosition],
      strokeWeight: 3,
      strokeColor: '#00a0e9',
      strokeOpacity: 1,
      strokeStyle: 'solid',
      fillColor: '#00a0e9',
      fillOpacity: 0.2
    });


  } else {

    var drawingPath = this.drawingPolygon.getPath();

    drawingPath.push(clickPosition);

    this.drawingPolygon.setPath(drawingPath);

    var path = this.polygon.getPath();

    path.push(clickPosition);

    this.polygon.setPath(path);
  }
}

Editor.prototype.moveActivePolygon = function(e) {
  if (this.drawingFlag) {

    var mousePosition = e.latLng;

    var path = this.drawingPolygon.getPath();

    if (path.length > 1) {
      path.pop();
    }

    path.push(mousePosition);

    this.drawingPolygon.setPath(path);
  }
}

Editor.prototype.rightActivePolygon = function(e) {

  if (this.drawingFlag) {

    this.drawingPolygon.setMap(null);
    this.drawingPolygon = null;

    var path = this.polygon.getPath();

    if (path.length > 2) {

      this.polygon.setMap(this.map);

      var area = Math.round(this.polygon.getArea()),
        content = '<div class="info">총면적 <span class="number"> ' + area + '</span> m<sup>2</sup></div>';

      this.areaOverlay = new daum.maps.CustomOverlay({
        map: this.map,
        content: content,
        xAnchor: 0,
        yAnchor: 0,
        position: path[path.length - 1]
      });

      path = this.polygon.getPath();

      var coordContent = "<Polygon><outerBoundaryIs><LinearRing><coordinates>\n"
      path.forEach((coord) => {
        coordContent += coord.getLng() + "," + coord.getLat() + "," + 0 + ".\n"
      })
      coordContent += path[0].getLng() + "," + path[0].getLat() + "," + 0 + ".\n"
      coordContent += "</coordinates></LinearRing></outerBoundaryIs></Polygon>";

      this.polygonArea.value = coordContent;

    } else {
      this.polygon = null;
    }
    this.drawingFlag = false;
  }
}


Editor.prototype.showActiveTile = function(e) {
  editor.log('showActiveTile()');

  var center = e.latLng
  var tile = this.getTileFromLocation(center.getLat(), center.getLng(), this.zoomLevel)
  var tileCenter = editor.getCenterOfTile.apply(this, tile)

  this.removePlaceMarker();
  this.tileMarker.setMap(this.map);

  this.infoWindow.close();

  this.tileMarker.setPosition(new daum.maps.LatLng(tileCenter[0], tileCenter[1]));

  var boxArgs = editor.getBoundingbox.apply(this, tile)
  boxArgs = boxArgs.concat(['#0F0', 5, 0.5])

  this.drawClickedBox.apply(this, boxArgs)

  tileCenter.pop()
  var content =
    '<b>타일 정보</b>' +
    '<ul>' +
    '<li>' +
    '인덱스: (' + tile.join(', ') + 'z)' +
    '</li>' +
    '<li>' +
    '위경도: ' + tileCenter.join(', ') +
    '</li>' +
    '</ul>'

  var tileCenterLatLng = new daum.maps.LatLng(tileCenter[0], tileCenter[1])
  var geofences = editor.getGeofencesContains(tileCenterLatLng)
  var geofenceContent = ''
  if (geofences.length) {
    geofences.forEach((geofence) => {
      geofenceContent +=
        '<ul>' +
        '<li>' + geofence.data.targetName + ' (' + geofence.data.targetId + ')' + '</li>' +
        '<ul>' +
        '<li>' +
        'zid: ' + geofence.data.zid +
        '</li>' +
        '<li>' +
        '위경도: ' + geofence.circle.getPosition().getLat() + ', ' + geofence.circle.getPosition().getLng() +
        '</li>' +
        '<li>' +
        '반지름: ' + geofence.circle.getRadius() + 'm' +
        '</li>' +
        '</ul>' +
        '</ul>'
    })
  }

  if (!geofenceContent) {
    geofenceContent = '<ul><li>없음</li></ul>'
  }

  content +=
    '<b>정보</b>' +
    geofenceContent

  this.infoWindow.setContent(content)

}

Editor.prototype.log = function() {
  var args = Array.prototype.slice.apply(arguments)

  console.log.apply(this, args)
  // var logParagraph = document.getElementById('log')
  // var liElem = document.createElement('li')

  // liElem.textContent = args.join(', ')
  // logParagraph.prepend(liElem)
}

Editor.prototype.scrollEvent = (function() {
  var timer = null;

  return (function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      editor.fetchGeofences()
    }, 150);
  }).bind(this);
})()

Editor.prototype.fetchFences = function(url, firstCall) {
  var thiz = this

  var fetchResult = fetch(url, {
      mode: 'no-cors'
    })
    .then(function(response) {
      return response.json()
        .then(function(json) {
          console.log(url, json)
          if(json.statusCode != null && json.statusCode != 200){
              thiz.refreshToken();
          }
          // process your JSON further
          thiz.drawCircles(json, firstCall)

          if ('nextFetchUrl' in json) {
            thiz.fetchFences(json.nextFetchUrl, false)
          }
        })
        .catch(function(e) {
          // process your JSON further
          console.error(e)
        })
    })

this.drawBoxes()

  return fetchResult
}

Editor.prototype.refreshToken = function(){
  var fetchResult = fetch('/v2/refresh', {
      mode: 'no-cors'
    })
    .then(function(response) {
      return response.json()
        .then(function(json) {
        })
    })
}


Editor.prototype.fetchGeofences = function() {
  var center = this.map.getCenter();

  this.redrawTiles()

  this.fetchFences('', true)
}

Editor.prototype.redrawTiles = function() {
  while (this.shapes.length > 0) {
    this.shapes.pop().setMap(null)
  }
}

const config = {
  originLatitude: 0.000035172785288750674,
  originLongitude: 0.0009234211775037693,
  baseAngleOfLatitude: 249.92137750890106,
  baseAngleOfLongitude: 315.3063262924552
}

Editor.prototype.getDeltaOfLatitude = function(zoom) {
  return config.baseAngleOfLatitude / Math.pow(2, zoom)
}

Editor.prototype.getDeltaOfLongitude = function(zoom) {
  return config.baseAngleOfLongitude / Math.pow(2, zoom)
}

Editor.prototype.getTileFromLocation = function(lat, lng, zoom) {
  var lat2tile = (x, zoom) => Math.floor((x - config.originLatitude) / this.getDeltaOfLatitude(zoom))
  var lng2tile = (x, zoom) => Math.floor((x - config.originLongitude) / this.getDeltaOfLongitude(zoom))

  // editor.log.apply(this, ['getTileFromLocation: '].concat([lat2tile(lat, zoom), lng2tile(lng, zoom), zoom]))
  return [lat2tile(lat, zoom), lng2tile(lng, zoom), zoom]
}

Editor.prototype.getLocationFromTile = function(xtile, ytile, zoom) {
  var lat2tile = (x, zoom) => x * this.getDeltaOfLatitude(zoom) + config.originLatitude
  var lng2tile = (x, zoom) => x * this.getDeltaOfLongitude(zoom) + config.originLongitude

  // editor.log.apply(null, ['getLocationFromTile: '].concat([lat2tile(xtile, zoom), lng2tile(ytile, zoom), zoom]))
  return [lat2tile(xtile, zoom), lng2tile(ytile, zoom), zoom]
}

Editor.prototype.getBoundingbox = function(x, y, zoom) {
  var c0 = this.getLocationFromTile(x, y, zoom);
  var c1 = this.getLocationFromTile(x + 1, y + 1, zoom);

  return [c0[0], c0[1], c1[0], c1[1]];
};

Editor.prototype.getCenterOfTile = function(x, y, zoom) {
  var bbox = this.getBoundingbox(x, y, zoom);

  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2, zoom];
}

Editor.prototype.drawClickedBox = function(lat1, lng1, lat2, lng2, color, strokeWeight, fillOpacity) {
  color = color || '#0000ff'
  strokeWeight = strokeWeight || 0.5
  fillOpacity = fillOpacity || 0.1

  var boxCoordinates = [
    new daum.maps.LatLng(lat1, lng1),
    new daum.maps.LatLng(lat2, lng1),
    new daum.maps.LatLng(lat2, lng2),
    new daum.maps.LatLng(lat1, lng2),
    new daum.maps.LatLng(lat1, lng1)
  ];

  if (this.clickedTile) {
    this.clickedTile.setMap(null)
  }

  this.clickedTile = (new daum.maps.Polyline({
    path: boxCoordinates,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: strokeWeight,
    fillColor: color,
    fillOpacity: 0.1,
    clickable: false,
    map: this.map
  }))
}

Editor.prototype.drawBoxes = function(lat, lng) {
  // editor.log('drawBoxes getLevel : '+this.map.getLevel() + ', lat : '+lat+', lng : '+lng)

  if (this.map.getLevel() > 6)
    return

  var drawBox = function(lat1, lng1, lat2, lng2, color, strokeWeight, fillOpacity) {
    color = color || '#0000ff'
    strokeWeight = strokeWeight || 0.5
    fillOpacity = fillOpacity || 0.1

    var boxCoordinates = [
      new daum.maps.LatLng(lat1, lng1),
      new daum.maps.LatLng(lat2, lng1),
      new daum.maps.LatLng(lat2, lng2),
      new daum.maps.LatLng(lat1, lng2),
      new daum.maps.LatLng(lat1, lng1)
    ];

    this.shapes.push(new daum.maps.Polyline({
      path: boxCoordinates,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: strokeWeight,
      fillColor: color,
      fillOpacity: 0.1,
      clickable: false,
      map: this.map
    }))
  }

  try {
    var bounds = editor.map.getBounds()
    var northEast = bounds.getNorthEast()
    var southWest = bounds.getSouthWest()

    var swTile = this.getTileFromLocation(southWest.getLat(), southWest.getLng(), this.zoomLevel)
    var neTile = this.getTileFromLocation(northEast.getLat(), northEast.getLng(), this.zoomLevel)

    for (var tx = swTile[0]; tx <= neTile[0]; tx++) {
      for (var ty = swTile[1]; ty <= neTile[1]; ty++) {
        var box = this.getBoundingbox.apply(this, [tx, ty, this.zoomLevel])
        drawBox.apply(this, box)
      }
    }
  } catch (e) {
    editor.log(e)
  }
}

Editor.prototype.drawCircles = function(data, refreshable) {
  editor.log((refreshable) ? 'Newly' : 'Additionally', this.geofences.length + ' geofence(s) are downloaded')
  if (refreshable) {
    // clear whole shapes
    while (this.geofences.length > 0) {
      this.geofences.pop().circle.setMap(null)
    }
  }

  if ('proximities' in data) {
    var list = data.proximities.geofenceData
    var length = list.length

    // length = 1
    for (var idx = 0; idx < length; idx++) {
      var geofence = list[idx]

      var circle = new daum.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.1,
        clickable: false,
        map: this.map,
        center: new daum.maps.LatLng(geofence.source.geometry.coordinates[1], geofence.source.geometry.coordinates[0]),
        radius: geofence.source.geometry.radius
      })

      // Add the circle
      this.geofences.push({
        circle: circle,
        data: {
          targetId: geofence.baseTarget.targetId,
          targetName: geofence.baseTarget.targetName,
          zid: geofence.source.zid,
          lng: geofence.source.geometry.coordinates[0],
          lat: geofence.source.geometry.coordinates[1],
          radius: geofence.source.geometry.radius
        }
      })
    }
  }
}
