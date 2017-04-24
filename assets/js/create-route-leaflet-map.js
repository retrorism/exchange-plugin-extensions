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
        lineColor = leaflet_vars.leaflet_line_color ? leaflet_vars.leaflet_line_color : 'red';
    
    if ( undefined == autoDraw ) {
        this.autoDraw = false;
    } else {
        this.autoDraw = autoDraw;
    }
    this.map = map;
    this.createPopup = function( data ) {
        var html = '';
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
            html += '<h5 class="map__popup__title">' + data.title + '</h5>';
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
        
        return html;
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

        markers.exchangeDetails.popup = L.popup().setContent( LMP_Map.createPopup( markers.exchangeDetails ), {
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
        var mappable_objects = [];
        if ( leafletObjectInstance.map_markers && leafletObjectInstance.map_markers.length ) {

        }
        if ( leafletObjectInstance.map_polylines && leafletObjectInstance.map_polylines.length ) {
            mappable_objects = mappable_objects.concat( leafletObjectInstance.map_polylines.map( LMP_Map.createNewerRoute ) );
        }
        return mappable_objects;
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
        if ( LMP_Map.clusterLayer == undefined ) {
            LMP_Map.clusterLayer = new L.markerClusterGroup({
                showCoverageOnHover : false,
                spiderLegPolylineOptions : {
                    color : lineColor
                }
            });
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
        var groups = [];
        LMP_Map.createMapLayers( leafletObjectInstance ).map( function( group ) {
            if ( group ) {
                console.log( group );
                groups.push( group );
            }
        })
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