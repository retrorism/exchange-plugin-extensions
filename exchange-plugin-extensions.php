<?php
    /*
    Plugin Name: Exchange Plugin Extension Kit
    Author: Willem Prins | Somtijds
    Author URI: http://www.somtijds.nl
    Version: 0.1
    License: GPL2
    */

if ( ! class_exists( 'Exchange_Plugin_Extension' ) ) {
    /**
     * Exchange Plugin Extension
     *
     * @package exchange-plugin-extensions
     * @author 
     **/
    class Exchange_Plugin_Extension {
        
        /**
         * Exchange Options (per plugin)
         *
         *
         **/
        public $exchange_options = array();

        /**
         * Plugin requirements
         *
         * @var array $required_plugins
         **/
        public $required_plugins;
        
        /**
         * Variable which will contain the missing plugins to be used in the notification.
         *
         * @var string $missing_plugin_uri
         **/
        public $missing_plugins = array();

        public $to_head = '';

        /**
        * Return default options array
        *
        * @return array
        * @author Willem Prins <willem@somtijds.nl>
        **/
        public function exchange_default_options() {
            return array();
        }


        public function core_hooks() {
            $this->set_exchange_options();
        }

        public function set_to_head() {         
            $this->to_head = '
            <script type="text/javascript">
                if ( Exchange == undefined ) {
                    var Exchange = {};
                }
                if ( Exchange.PluginExtensions == undefined ) {
                    Exchange.PluginExtensions = {};
                }
            </script>';
        }

        /**
        * Loop over options to store / override defaults.
        *
        * @return void
        * @author Willem Prins <willem@somtijds.nl>
        **/
        public function set_exchange_options() {
            if ( empty( $this->exchange_options ) ) {
                $this->exchange_default_options();
            }
            foreach ( $this->exchange_options as $key => $default ) {
                $stored = get_option( $key );
                if ( empty( $stored ) ) {
                    update_option( $key, $default );
                } else {
                    $this->exchange_options[ $key ] = $stored;
                }
            }
        }

        public function get_exchange_options( $option_name = '' ) {
            if ( empty( $option_name ) ) {
                return $this->exchange_options;
            } elseif ( array_key_exists( $option_name, $this->exchange_options ) ) {
                return $this->exchange_options[ $option_name ];
            } else {
                return false;
            }
        }

        /**
        * Check for required plugins
        *
        * @return void
        * @author Willem Prins <willem@somtijds.nl>
        **/
        public function have_required_plugins() {
            
            if ( empty( $this->required_plugins ) ) {
                return true;
            }            
            $active_plugins = (array) get_option( 'active_plugins', array() );
            if ( is_multisite() ) {
                $active_plugins = array_merge( $active_plugins, get_site_option( 'active_sitewide_plugins', array() ) );
            }
            foreach ( $this->required_plugins as $plugin_slug => $plugin_uri ) {
                $required = "{$plugin_slug}/{$plugin_slug}.php";
                if ( ! in_array( $required, $active_plugins ) && ! array_key_exists( $required, $active_plugins ) ) {
                    $this->missing_plugins[ $plugin_slug ] = $plugin_uri;
                return false;
                }
            }
            return true;
        }

        /**
         * Notify user of missing plugin
         *
         * @return void
         * @author Willem Prins <willem@somtijds.nl>
         **/
        public function missing_plugin_notification() {
            $links = array();
            foreach( $this->missing_plugins as $plugin_slug => $plugin_uri ) {
                $links[] =  '<a href="' . $plugin_uri . '" target="_blank">' . $plugin_slug . '</a>';
            }
            if ( empty( $links ) ) {
                return;
            }
            $link_string = implode( ',', $links );
                ?>
                <div class="notice notice-warning">
                    <p><?php printf(__( 'Please install and activate %s to use its Exchange extension functionality.', 'exchange' ), $link_string ); ?></p>
                </div>
                <?php
        }

        /**
         * Add scripts and styles to head.
         *
         * @return void
         * @author Willem Prins
         **/
        function scripts_and_styles_to_head() {
            $this->set_to_head();
            if ( ! empty( $this->to_head ) ) {
                echo $this->to_head;
            }
        }
        /**
         * Initialize plugin
         *
         * return void
         **/
        public function init() {
            if ( ! $this->have_required_plugins() ) {
                add_action( 'admin_notices', array( $this, 'missing_plugin_notification' ) );
                return;
            }
            add_action( 'wp_head', array( $this, 'scripts_and_styles_to_head' ) );
            add_action( 'plugins_loaded', array( $this, 'core_hooks' ), 99 );

            if ( method_exists( $this, 'script_and_style_hooks' ) ) {
                add_action( 'wp_enqueue_scripts', array( $this, 'script_and_style_hooks'), 99 );
            }
        }
    } // END class

    $exchange_plugin_extensions = new Exchange_Plugin_Extension();
    $exchange_plugin_extensions->init();
}

require_once( plugin_dir_path( __FILE__ ) . '/classes/class-leaflet-map-plugin-extension.php' );


?>