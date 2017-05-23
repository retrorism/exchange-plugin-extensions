<?php
/**
 * Leaflet Map Extension Class
 *
 * @package exchange-plugin-extensions
 * @author Willem Prins <willem@somtijds.nl>
 **/ 

if ( ! class_exists( 'Leaflet_Map_Plugin_Extension' ) ) {
    /**
     * Leaflet_Map_Extension Class
     * 
     * @package exchange-plugin-extensions
     * @author Willem Prins <willem@somtijds.nl>
     **/ 
    class Leaflet_Map_Plugin_Extension extends Exchange_Plugin_Extension {

        public $required_plugins = array( 'leaflet-map' => 'https://wordpress.org/plugins/leaflet-map/' );

        /**
         * Add options to customies Leaflet styles
         *
         * @link https://code.tutsplus.com/articles/how-to-use-wordpress-color-picker-api--wp-33067
         * @return void
         * @author 
         **/
        public function admin_options() {
            if ( ! defined( 'EXCHANGE_PLUGIN' ) || ! is_admin() ) {
                return;
            }

            add_settings_field(
                    'leaflet_icon_url',
                __( 'Icon for map markers', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_icon_url_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_icon_url' )
            );
            add_settings_field(
                    'leaflet_line_color',
                __( 'Color for lines rendered in maps', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_line_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_line_color' )
            );
            add_settings_field(
                    'leaflet_cluster_small_color',
                __( 'Color for small clusters', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_cluster_small_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_cluster_small_color' )
            );
            add_settings_field(
                    'leaflet_cluster_medium_color',
                __( 'Color for medium clusters', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_cluster_medium_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_cluster_medium_color' )
            );
            add_settings_field(
                    'leaflet_cluster_large_color',
                __( 'Color for large clusters', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_cluster_large_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_cluster_large_color' )
            );
            add_settings_field(
                    'leaflet_cluster_small_div_color',
                __( 'Color for small cluster divs', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_cluster_small_div_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_cluster_small_div_color' )
            );
            add_settings_field(
                    'leaflet_cluster_medium_div_color',
                __( 'Color for medium cluster divs', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_cluster_medium_div_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_cluster_medium_div_color' )
            );
            add_settings_field(
                    'leaflet_cluster_large_div_color',
                __( 'Color for large cluster divs', EXCHANGE_PLUGIN ),
                array( &$this, 'leaflet_cluster_large_div_color_cb' ),
                EXCHANGE_PLUGIN,
                EXCHANGE_PLUGIN . '_general',
                array( 'label_for' => 'leaflet_cluster_large_div_color' )
            );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_icon_url', array( &$this, 'exchange_sanitize_url' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_line_color', array( &$this, 'exchange_sanitize_hex_color' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_cluster_small_color', array( &$this, 'exchange_sanitize_hex_color' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_cluster_medium_color', array( &$this, 'exchange_sanitize_hex_color' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_cluster_large_color', array( &$this, 'exchange_sanitize_hex_color' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_cluster_small_div_color', array( &$this, 'exchange_sanitize_hex_color' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_cluster_medium_div_color', array( &$this, 'exchange_sanitize_hex_color' ) );
            register_setting( EXCHANGE_PLUGIN, 'leaflet_cluster_large_div_color', array( &$this, 'exchange_sanitize_hex_color' ) );
        }

        /**
         * Function that will check if value is a valid HEX color.
         */
        public function exchange_sanitize_hex_color( $value ) { 
             
            if ( preg_match( '/^#[a-f0-9]{6}$/i', $value ) ) { // if user insert a HEX color with #     
                return $value;
            } 
            return false;

        }

        /**
         * Function that will check if value is a valid URL
         * @todo actually sanitize
         */
        public function exchange_sanitize_url( $value ) { 
             
            return esc_url_raw( $value );

        }

        /**
         * Render an URL field
         *
         * @since  0.1.0
         */
        function leaflet_icon_url_cb() {
            
            $stored  = get_option( 'leaflet_icon_url_cb' );
            $val = ! empty( $stored ) ? $stored : $this->exchange_options['leaflet_icon_url'];
            ?>
            <fieldset>
                <label for="leaflet_icon_url_cb">
                    <?php _e( 'Pick an icon url', EXCHANGE_PLUGIN ); ?>
                </label>
                <input type="text" size="120"
                    name="leaflet_icon_url"
                    id="leaflet_icon_url"
                    <?php if ( ! empty( $val ) ) : ?>
                    value="<?php echo $val; ?>"
                    <?php else : ?>
                    placeholder="<?php _e('Add a valid image URL here', EXCHANGE_PLUGIN ); ?>"
                    <?php endif; ?>
            </fieldset>
            <?php

        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function exchange_render_color_box( $option_name ) {
            $stored = get_option( EXCHANGE_PLUGIN . $option_name );
            $val = ! empty( $stored ) ? $stored : $this->exchange_options[ $option_name ];
            ?>

            <fieldset>
                <label for="<?php echo $option_name ?>">
                    <?php echo wp_sprintf( __( 'Pick a color for %s', EXCHANGE_PLUGIN ), $option_name); ?>
                </label>
                 <input
                    size="8"
                    type="text" 
                    name="<?php echo $option_name; ?>" 
                    <?php if ( ! empty( $val ) ) : ?>
                    value="<?php echo $val; ?>"
                    <?php else : ?>
                    placeholder="<?php _e('#ff00ff', EXCHANGE_PLUGIN ); ?>"
                    <?php endif; ?>
                    class="lmpe-color-picker" >
            </fieldset>
            <?php
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_line_color_cb() {
            $option_name = 'leaflet_line_color';
            $this->exchange_render_color_box( $option_name );
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_cluster_small_color_cb() {
            $option_name = 'leaflet_cluster_small_color';
            $this->exchange_render_color_box( $option_name );
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_cluster_medium_color_cb() {
            $option_name = 'leaflet_cluster_medium_color';
            $this->exchange_render_color_box( $option_name );
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_cluster_large_color_cb() {
            $option_name = 'leaflet_cluster_large_color';
            $this->exchange_render_color_box( $option_name );
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_cluster_small_div_color_cb() {
            $option_name = 'leaflet_cluster_small_div_color';
            $this->exchange_render_color_box( $option_name );
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_cluster_medium_div_color_cb() {
            $option_name = 'leaflet_cluster_medium_div_color';
            $this->exchange_render_color_box( $option_name );
        }

        /**
         * Render colorbox for this option
         *
         * @since  0.1.0
         */
        function leaflet_cluster_large_div_color_cb() {
            $option_name = 'leaflet_cluster_large_div_color';
            $this->exchange_render_color_box( $option_name );
        }

        public function exchange_default_options() {
            $this->exchange_options = array(
                'leaflet_map_tile_url'             => 'https://api.mapbox.com/styles/v1/retrorism/cio2pv2ft001ybvm8qb4da6f9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmV0cm9yaXNtIiwiYSI6IlhRWTE0d2cifQ.-Wi_jReZU4Wz_owPnVZDwQ',
                'leaflet_line_color'               => '#f4c522',
                'leaflet_icon_url'                 => plugins_url('/exchange-plugin-extensions/assets/images/T_dot_WEB.png'),
                'leaflet_cluster_small_color'      => '#f0c063',
                'leaflet_cluster_medium_color'     => '#eba847',
                'leaflet_cluster_large_color'      => '#e27f20',
                'leaflet_cluster_small_div_color'  => '#f0c063',
                'leaflet_cluster_medium_div_color' => '#eba847',
                'leaflet_cluster_large_div_color'  => '#e27f20',
            );
        }

        public function set_to_head() {
            $this->to_head = '
            <style>
                .marker-cluster-small {
                    background-color: ' . $this->get_exchange_options('leaflet_cluster_small_color') . ';
                }
                .marker-cluster-small div {
                    background-color: ' . $this->get_exchange_options('leaflet_cluster_small_div_color') . ';
                }
                .marker-cluster-medium {
                    background-color: ' . $this->get_exchange_options('leaflet_cluster_medium_color') . ';
                }
                .marker-cluster-medium div {
                    background-color: ' . $this->get_exchange_options('leaflet_cluster_medium_div_color') . ';
                }
                .marker-cluster-large {
                    background-color: ' . $this->get_exchange_options('leaflet_cluster_large_color') . ';
                }
                .marker-cluster-large div {
                    background-color: ' . $this->get_exchange_options('leaflet_cluster_large_div_color') . ';
                }
                .marker-cluster {
                        background-clip: padding-box;
                        border-radius: 20px;
                        }
                    .marker-cluster div {
                        width: 30px;
                        height: 30px;
                        margin-left: 5px;
                        margin-top: 5px;

                        text-align: center;
                        border-radius: 15px;
                        font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
                        }
                    .marker-cluster span {
                        line-height: 30px;
                        }

                    .leaflet-container.focus .leaflet-tile {
                        -webkit-filter: grayscale(1);
                        filter: grayscale(1);
                    }
                }
            </style>';
        }

        public function core_hooks() {
            remove_shortcode( 'leaflet-map', array( 'Leaflet_Map_Plugin', 'map_shortcode' ) );
            add_shortcode( 'leaflet-map', array( $this, 'map_shortcode_extension' ) );
            add_shortcode( 'leaflet-polyline', array( $this, 'polyline_shortcode' ) );
            add_shortcode( 'leaflet-layers', array( $this, 'layers_shortcode' ) );
            remove_filter( 'plugin_action_links_leaflet-map', array( 'Leaflet_Map_Plugin', 'plugin_action_links' ) );
            $this->set_exchange_options();
        }

        public function admin_script_and_style_hooks() {
            // Make sure to add the wp-color-picker dependecy to js file
            wp_enqueue_script( 'lmpe_custom_js', plugins_url( '/assets/js/jquery.colorpicker.js', __FILE__ ), array( 'jquery', 'wp-color-picker' ), '', true  );
            // Css rules for Color Picker
            wp_enqueue_style( 'wp-color-picker' );
        }

        public function script_and_style_hooks() {
            wp_register_script('leaflet_markercluster_js', plugins_url( '../assets/js/leaflet.markercluster.js', __FILE__ ), array('leaflet_js'), false, true);
            wp_register_script('leaflet_snake_js', plugins_url( '../assets/js/L.Polyline.SnakeAnim.js', __FILE__ ), array('leaflet_js'), false, true);
            wp_register_script('leaflet_create_route_js', plugins_url( '../assets/js/create-route-leaflet-map.js', __FILE__ ), array('leaflet_js','leaflet_snake_js'), false, true);
            wp_register_style('leaflet_markercluster_css', plugins_url( '../assets/css/MarkerCluster.css', __FILE__ ),'','');
            wp_register_style('leaflet_markercluster_exchange_css', plugins_url( '../assets/css/MarkerClusterExchange.css', __FILE__ ),'','');
        }

        public function map_shortcode_extension( $atts ) {
             if ( ! class_exists( 'Leaflet_Map_Plugin' ) ) {                             
                return;
            }
            wp_enqueue_script('leaflet_js');
            wp_enqueue_script('leaflet_snake_js');
            wp_enqueue_script('leaflet_markercluster_js');
            wp_enqueue_script('leaflet_create_route_js');
            wp_enqueue_style('leaflet_markercluster_css');
            wp_enqueue_style('leaflet_markercluster_exchange_css');

            $translate_this = self::get_exchange_options();
            $translate_this['leaflet_hashes'] = array();

            //after wp_enqueue_script
            wp_localize_script( 'leaflet_create_route_js', 'leaflet_vars', $translate_this );
            return Leaflet_Map_Plugin::map_shortcode( $atts );
        }

        public function polyline_shortcode ( $atts, $content = null ) {
            if ( ! class_exists( 'Leaflet_Map_Plugin' ) ) {
                return;
            }
            if ( ! empty( $atts ) ) {
                extract( $atts );
            }

            $style_json = Leaflet_Map_Plugin::get_style_json( $atts );

            $fitbounds = empty( $fitbounds ) ? 0 : $fitbounds;

            $locations = array();
            $markers = array();
            $lines = array();

            if ( ! empty( $latlngs ) ) {
                $latlngs = preg_split( '/\s?[;|\/]\s?/', $latlngs );
                foreach ( $latlngs as $latlng ) {
                    if ( trim( $latlng ) ) {
                        $locations[] = array_map( 'floatval', preg_split( '/\s?,\s?/', $latlng ) );
                    }
                }
            } elseif ( ! empty( $addresses ) ) {
                $addresses = preg_split( '/\s?[;|\/]\s?/', $addresses );
                foreach ( $addresses as $address ) {
                    if ( trim( $address ) ) {
                        $geocoded = Leaflet_Map_Plugin::geocoder( $address );
                        $locations[] = array( $geocoded->{'lat'}, $geocoded->{'lng'} );
                    }
                }
            } elseif ( ! empty( $coordinates ) ) {
                $coordinates = preg_split( '/\s?[;|\/]\s?/', $coordinates );
                foreach ( $coordinates as $xy ) {
                    if ( trim( $xy ) ) {
                        $locations[] = array_map( 'floatval', preg_split( '/\s?,\s?/', $xy ) );
                    }
                }
            }
            if ( ! empty( $cities ) ) {
                $city_labels = preg_split( '/\s?[;|\/]\s?/', $cities );
            }

            $length = count( $locations );
            // Adding markers and lines to their respective arrays.
            for ( $i = 0; $i < $length; $i++ ) {
                $markers[] = $locations[$i];
                if ( $i === $length - 1 ) {
                    if ( $length > 2 ) {
                        $lines[] = array( $locations[$i], $locations[0] );
                    }
                } else {
                    $lines[] = array( $locations[$i], $locations[$i+1] );
                }
            }
            if ( $length == 2 ) {
                $markers[] = $locations[1];
            }
            // https://github.com/jseppi/Leaflet.MakiMarkers
            $location_json = json_encode($locations);
            $lines_json = json_encode($lines);
            $markers_json = json_encode($markers);
            $cities_json = json_encode($city_labels);

            $line_script = "<script>
            WPLeafletMapPlugin.add(function () {
                var previous_map = WPLeafletMapPlugin.getCurrentMap(),
                    fitbounds = $fitbounds,
                    route = createRoute($markers_json,$lines_json,$cities_json);
                    ";

                    $message = empty($message) ? (empty($content) ? '' : $content) : $message;

                    if (!empty($message)) {

                        $message = str_replace("\n", '', $message);
                        $line_script .= "route.bindPopup('$message')";
                        if ($visible) {
                                $marker_script .= ".openPopup()";
                            }
                        $line_script .= ";";
                    }

                    $line_script .= "
                route.addTo( previous_map );

                if ( fitbounds ) {
                    // zoom the map to the polyline
                    previous_map.fitBounds( route.getBounds().pad(0.033) );
                }
                route.snakeIn();

                WPLeafletMapPlugin.lines.push( route );
            })
            </script>";

            return $line_script;
        }

        public function layers_shortcode( $atts ) {
            $auto_draw = isset( $atts['auto_draw'] ) ? 'true' : 'false';
            $layers_script = "<script>
                WPLeafletMapPlugin.add( function() {
                    var map = WPLeafletMapPlugin.getCurrentMap();
                    if ( typeof leaflet_vars.hashes !== 'Array' ) {
                        leaflet_vars.leaflet_hashes = [];
                    }
                    if ( map != undefined ) {
                        var hashMapPair = {
                            hash : '" . $atts['map_hash'] . "',
                            map : map,
                            autoDraw : " . $auto_draw . "
                        };
                        leaflet_vars.leaflet_hashes.push( hashMapPair );
                    }
                })
            </script>";
            return $layers_script;      
        }

    } /* end class */
    $exchange_leaflet_map = new Leaflet_Map_Plugin_Extension();
    $exchange_leaflet_map->init();    
}
