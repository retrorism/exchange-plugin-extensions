/*
    arr_m = markers
    arr_l = lines
    arr_c = cities
*/

if ( Exchange == undefined ) {
    var Exchange = {};
}

if ( Exchange.PluginExtensions == undefined ) {
    Exchange.PluginExtensions = {};
}

if ( Exchange.PluginExtensions.LMP == undefined ) {
    Exchange.PluginExtensions.LMP = {
        maps : {},
        init : function() {
            hashMapPairs = leaflet_vars.leaflet_hashes;

            if ( hashMapPairs.length > 0 ) {
                for ( var i = 0; hashMapPairs.length > i; i++ ) {
                    var hash = hashMapPairs[i].hash,
                        mapToRender = hashMapPairs[i].map,
                        autoDraw = hashMapPairs[i].autoDraw,
                        mapObjectInstance = window['leaflet_objects_' + hash ];
                    if ( mapToRender != undefined && mapObjectInstance != undefined ) {
                        Exchange.PluginExtensions.LMP.maps['map_' + hash] = new Exchange_LMP_Map( mapToRender, autoDraw );
                        Exchange.PluginExtensions.LMP.maps['map_' + hash].renderObjects( mapObjectInstance );
                    }
                }
            }
        }
    }
}

// initialize the function
if (window.addEventListener) {
    window.addEventListener('load', Exchange.PluginExtensions.LMP.init, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', function() {
        // hopefully this helps any references to `this`
        Exchange.PluginExtensions.LMP.init();
    });
}

function Exchange_LMP_Map( map, autoDraw ) {
    var LMP_Map = this,
        iconUrl = leaflet_vars.leaflet_icon_url ? leaflet_vars.leaflet_icon_url : 'https://unpkg.com/leaflet@1.0.3/dist/images/marker-icon.png',
        iconSize = leaflet_vars.leaflet_icon_size ? leaflet_vars.leaflet_icon_size : [14, 14],
        iconAnchor = leaflet_vars.leaflet_icon_anchor ? leaflet_vars.leaflet_icon_anchor : [7, 7],
        lineColor = leaflet_vars.leaflet_line_color ? leaflet_vars.leaflet_line_color : 'red',
        clusterIconWidth = leaflet_vars.leaflet_cluster_icon_pixel_width ? leaflet_vars.leaflet_cluster_icon_pixel_width : 0,
        clusterSingleMarkerMode = false;
        clusterMarkerOptions = {
            showCoverageOnHover : false,
            singleMarkerMode : false,
            spiderLegPolylineOptions : {
                color : lineColor
            },
            iconCreateFunction: function ( cluster ) {
                var childCount = cluster.getChildCount();
                var c = ' marker-cluster-';
                if (childCount < 10) {
                    c += 'small';
                } else if (childCount < 100) {
                    c += 'medium';
                } else {
                    c += 'large';
                }
                return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(clusterIconWidth, clusterIconWidth) });
            }
        };
        if ( -1 == clusterIconWidth ) {
            clusterSingleMarkerMode = true;
            clusterMarkerOptions.singleMarkerMode = true;
            clusterMarkerOptions.iconCreateFunction = function () {
                var className = 'map__marker';
                return L.divIcon({
                    html: '<img class=\"map__marker__image\" src=\"' + iconUrl + '\">',
                    className: className
                });
            };
        }

    if ( undefined == autoDraw ) {
        this.autoDraw = false;
    } else {
        this.autoDraw = autoDraw;
    }
    this.map = map;
    this.createPopup = function( data ) {
        var html = '';
        if ( undefined != data.type ) {
            html += '<div class="map__popup__content-border ' + data.type + '">';
        }
        if ( undefined != data.link ) {
            html += '<a class="map__popup__link--image" href="' + data.link + '">'
        }
        if ( undefined != data.image ) {
            html += '<img class="map__popup__image" src="' + data.image + '">';
        }
        if ( undefined != data.link ) {
            html += '</a>';
        }
        html += '<div class="map__popup__info"><div class="map__popup__info-inner">';

        if ( undefined != data.link ) {
            html += '<a href="' + data.link + '">'
        }
        if ( undefined != data.title ) {
            var titleString = data.title;
            if ( undefined != data.country ) {
                titleString += '<span class="map__popup__title__addition">' + data.country.toUpperCase() + '</span>';
            }
            html += '<h5 class="map__popup__title">' + titleString + '</h5>';
        }
        if ( undefined != data.link ) {
            html += '</a>';
        }

        if ( undefined != data.partners ) {
            html += '<ul class="participants">'
            data.partners.map( function( p ) {
                html += '<li class="participant">'
                if ( p.name ) {
                    html += '<span class="participant__name">' + p.name + '</span>';
                }
                if ( undefined != p.org_name ) {
                    var city = p.city ? ', ' + p.city : '';
                    html += '<span class="participant__organisation-details">' + p.org_name + city + '</span>'
                }
                html += '</li>'
            })
            html += '</ul>';
        }
        html += '</div></div>';
        if ( undefined != data.participant_type ) {
            html += '</div>';
        }
        
        return html;
    }
    this.createMarker = function( participant ) {
        if ( participant.locations == undefined ) {
            return false;
        }
        var marker = L.marker( participant.locations[0].latlngs, {
            icon : new L.DivIcon({
                className: 'map__marker',
                html:   '<img class="map__marker__image" src="' + iconUrl + '">'
            })
        });
        marker.exchangeDetails = {
            title: participant.title,
            link: participant.link,
            image: participant.image,
            country: participant.locations[0].country,
            type: participant.locations[0].participant_type
        }
        if ( marker ) {
            marker.exchangeDetails.popup = L.popup({
            maxWidth: 400,
            minWidth: 250,
        }).setContent( LMP_Map.createPopup( marker.exchangeDetails ), {
                className : "map__popup"
            } );
            marker.bindPopup( marker.exchangeDetails.popup );
            return marker;
        }
    }

    this.createNewerRoute = function( collaboration ) {
        var markers = L.featureGroup(),
        leaflet_ids = [];
        markers.exchangeDetails = {
            title: collaboration.title,
            link: collaboration.link,
            image: collaboration.image,
            partners: [],
        };
        for ( var i = 0; collaboration.locations.length > i; i++ ) {
            var p = collaboration.locations[i],
            cityString = '';
            if ( p == undefined ) {
                return false;
            }
            if ( p.city != undefined ) {
                cityString = '<span class="map__marker__label">'+ p.city +'</span>';
            }
            if ( p.latlngs == undefined ) {
                return false;
            }
            if ( p.latlngs.length < 2 ) {
                return false;
            }
            var marker = L.marker( p.latlngs, {
                icon : new L.DivIcon({
                    className: 'map__marker',
                    html:   '<img class="map__marker__image" src="' + iconUrl + '">'
                })
            });
            if ( marker ) {
                marker.exchange_id = p.exchange_id;
                markers.exchangeDetails.partners.push({
                    exchange_id:     p.exchange_id,
                    name:   p.name,
                    coords: p.latlngs,
                    org_name: p.org_name,
                    city:   p.org_city,
                })
                markers.addLayer( marker );
            }
        }

        markers.exchangeDetails.popup = L.popup({
            maxWidth: 400,
            minWidth: 300,
        }).setContent( LMP_Map.createPopup( markers.exchangeDetails ), {
            className : "map__popup"
        } );
        if ( markers.exchangeDetails.partners.length > 1 ) {
            markers.eachLayer( function( layer ) {
                layer.exchangeDetails = markers.exchangeDetails;
            })
        } else {
            markers.eachLayer( function( layer ) {
                layer.bindPopup( markers.exchangeDetails.popup );
            })
        }
        return markers;
    };
    this.createMapLayers = function( leafletObjectInstance ) {
        var mappableObjects = [];
        if ( null == leafletObjectInstance.map_markers && null == leafletObjectInstance.map_polylines ) {
            return;
        }

        if ( leafletObjectInstance.map_markers && leafletObjectInstance.map_markers.length > 0 ) {
            for ( var i = 0; leafletObjectInstance.map_markers.length > i; i++ ) {
                var marker = LMP_Map.createMarker( leafletObjectInstance.map_markers[i] );
                var addMe = true;
                if ( ! marker || marker.getLatLng().lat == 0 || marker.getLatLng() == 0 ) {
                    addMe = false;
                }
                if ( addMe ) {
                    mappableObjects.push( marker );
                }
            }   
        }
        if ( leafletObjectInstance.map_polylines && leafletObjectInstance.map_polylines.length > 0 ) {
            for ( var i = 0; leafletObjectInstance.map_polylines.length > i; i++ ) {
                var cluster = LMP_Map.createNewerRoute( leafletObjectInstance.map_polylines[i] );
                if ( cluster.hasOwnProperty( '_layers' ) ) {
                    var addMe = true;
                    cluster.eachLayer( function( layer ) {
                        if ( layer.getLatLng().lat == 0 || layer.getLatLng() == 0 ) {
                            addMe = false;
                        }
                    });
                    if ( addMe ) {
                        mappableObjects.push( cluster );
                    }
                }
            }
        }
        if ( ! mappableObjects.length > 0 ) {
            return false;
        }
        return mappableObjects;
    };
    this.renderObjects = function( leafletObjectInstance ) {
        if ( leafletObjectInstance == undefined ) {
            console.log( 'objects are not defined');
            return;
        }
        if ( LMP_Map.map == undefined ) {
            console.log( 'map is not defined' );
            return;
        }
        var iconUrl = '',
            lineColor = '';
        if ( leaflet_vars != undefined ) {
            iconUrl = leaflet_vars.leaflet_icon_url;
            lineColor = leaflet_vars.leaflet_line_color;
        }
        LMP_Map.map.getContainer().classList.remove('focus');
        if ( LMP_Map.markerClusterGroupLayer == undefined ) {
            LMP_Map.clusterLayer = new L.markerClusterGroup( clusterMarkerOptions );
        } else {
            LMP_Map.clusterLayer.clearLayers();
        }
        if ( LMP_Map.networkLayer == undefined ) {
            LMP_Map.networkLayer = new L.featureGroup();
        } else {
            LMP_Map.networkLayer.clearLayers();
        }
        LMP_Map.network = {};
        LMP_Map.networkShowing = 0;
        var groups = LMP_Map.createMapLayers( leafletObjectInstance );
        if ( groups.length > 0 ) {
            LMP_Map.clusterLayer.addLayers( groups );
        }
        LMP_Map.clusterLayer.eachLayer( function( layer ) {
            LMP_Map.prepareNetworkLayer( layer );
        });
        LMP_Map.map.addLayer( LMP_Map.networkLayer );
        LMP_Map.map.whenReady( function() {
            this.addLayer( LMP_Map.clusterLayer )
                .fitBounds( LMP_Map.clusterLayer.getBounds().pad(0.033) );
        })
    };
    this.prepareNetworkLayer = function( layer ) {
        if ( layer.exchangeDetails == undefined ) {
            return;
        }
        if ( layer.exchangeDetails.partners && layer.exchangeDetails.partners.length > 1 ) {
            if ( autoDraw ) {
                LMP_Map.networkLayer.clearLayers();
                LMP_Map.map.removeLayer( LMP_Map.networkLayer );
                this.drawNetwork( layer );
                if ( LMP_Map.networkLayer != undefined ) {
                    LMP_Map.map.flyToBounds( LMP_Map.networkLayer.getBounds().pad( 0.033 ) )
                    .once('moveend',function( e ) {
                        LMP_Map.showNetwork( layer, true );
                    })
                }
            } else {
                layer.on('click', function() {
                    LMP_Map.addNetworkClick( this );
                })
                LMP_Map.map.on('click', function(e) {
                    if ( LMP_Map.networkShowing ) {
                        LMP_Map.map.removeLayer( LMP_Map.networkLayer );
                        LMP_Map.map.addLayer( LMP_Map.clusterLayer );
                        LMP_Map.map.getContainer().classList.remove('focus');
                        LMP_Map.networkShowing = 0;
                    }
                })
            }   
        }
    };
    this.addNetworkClick = function( layer ) {
        LMP_Map.netWorkShowing = 0;
        LMP_Map.networkLayer.clearLayers();
        LMP_Map.map.removeLayer( LMP_Map.networkLayer );
        this.drawNetwork( layer );
        LMP_Map.map.removeLayer( LMP_Map.clusterLayer )
            .addLayer( LMP_Map.networkLayer )
            .flyToBounds( LMP_Map.networkLayer.getBounds().pad( 0.033 ) )
            .once('moveend', function( e ) {
                LMP_Map.map.getContainer().classList.add('focus');
                LMP_Map.showNetwork( layer, false );
                LMP_Map.networkShowing = 1;
            });
    }
    this.drawNetwork = function( layer ) {
        var myLatLng = layer.getLatLng(),
            myLatLngArr = [myLatLng.lat, myLatLng.lng];
        layer.exchangeDetails.partners.map( function( loc ) {
            var marker = L.marker( loc.coords, {
                exchange_id: loc.id,
                icon : new L.DivIcon({
                    className: 'map__marker',
                    html:   '<img class=\"map__marker__image\" src=\"' + iconUrl + '\">'
                    + '<span class=\"map__marker__label\">'+ loc.city +'</span>'
                })
            })
            if ( marker ) {
                marker.addTo( LMP_Map.networkLayer );
            }
        });
        var myPartners = layer.exchangeDetails.partners.filter( function( loc ) {
            if ( loc.exchange_id != layer.exchange_id ) {
                return true;
            } 
        })
        if ( myPartners.length < layer.exchangeDetails.partners.length ) {
            var partnerCoords = myPartners.map( function( loc ) {
                return loc.coords;
            });
            partnerCoords.unshift( myLatLngArr );
            if ( partnerCoords.length > 2 ) {
                partnerCoords.push( myLatLngArr );
            }
        }
        if ( partnerCoords ) {
            LMP_Map.network = L.polyline( partnerCoords, {
                color : lineColor,
                className: 'map__line',
                weight : 6,
                opacity : 0.9,
                dashArray : '12, 10',
                lineJoin: 'round',
                snakingSpeed: 200
            } );
        }
    };
    this.showNetwork = function( layer, tooltipOnHover ) {
        if ( LMP_Map.network == undefined ) {
            return;
        }
        LMP_Map.network.addTo( LMP_Map.networkLayer )
        .bindTooltip( layer.exchangeDetails.popup._content, {
            permanent : ! tooltipOnHover,
            direction: 'auto',
            opacity: 0.95,
            interactive: true,
       } ).snakeIn()

    }
}