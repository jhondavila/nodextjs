/**
 * This class manages ready detection and handling. Direct use of this class is not
 * recommended. Instead use `Ext.onReady`:
 * 
 *      Ext.onReady(function () {
 *          // DOM and Framework are ready...
 *      });
 *
 * ## DOM Ready
 *
 * The lowest-level of readiness is DOM readiness. This level implies only that the document
 * body exists. Many things require the DOM to be ready for manipulation. If that is all
 * that is required, the `Ext.onDocumentReady` method can be called to register a callback
 * to be called as soon as the DOM is ready:
 *
 *      Ext.onDocumentReady(function () {
 *          // the document body is ready
 *      });
 *
 * ## Framework Ready
 *
 * In production builds of applications it is common to have all of the code loaded before
 * DOM ready, so the need to wait for "onReady" is often confused with only that concern.
 * This is easy to understand, at least in part because historically `Ext.onReady` only
 * waited for DOM ready.
 *
 * With the introduction of `Ext.Loader`, however, it became common for DOM ready to occur
 * in the middle of dynamically loading code. If application code were executed at that
 * time, any use of the yet-to-be-loaded classes would throw errors. As a consequence of
 * this, the `Ext.onReady` mechanism was extended to wait for both DOM ready *and* all of
 * the required classes to be loaded.
 *
 * When the framework enters or leaves a state where it is not ready (for example, the
 * first dynamic load is requested or last load completes), `Ext.env.Ready` is informed.
 * For example:
 *
 *      Ext.env.Ready.block();
 *
 *      //...
 *
 *      Ext.env.Ready.unblock();
 *
 * When there are no blocks and the DOM is ready, the Framework is ready and the "onReady"
 * callbacks are called.
 *
 * Priority can be used to control the ordering of onReady listeners, for example:
 *
 *     Ext.onReady(function() {
 *
 *     }, null, {
 *         priority: 100
 *     });
 *
 * Ready listeners with higher priorities will run sooner than those with lower priorities,
 * the default priority being `0`.  Internally the framework reserves priorities of 1000
 * or greater, and -1000 or lesser for onReady handlers that must run before or after
 * any application code.  Applications should stick to using priorities in the -999 - 999
 * range. The following priorities are currently in use by the framework:
 *
 * - Element_scroll rtl override: `1001`
 * - Event system initialization: `2000`
 * - Ext.dom.Element: `1500`
 *
 * @class Ext.env.Ready
 * @singleton
 * @private
 * @since 5.0.0
 */
(Ext.env || (Ext.env = {})).Ready = {
    // @define Ext.env.Ready
    // @require Ext.env.Browser
    // @require Ext.env.OS
    // @require Ext.env.Feature

    /**
     * @property {Number} blocks The number of Framework readiness blocks.
     * @private
     */
    blocks: 0,

    block: function () {
        ++this.blocks;
        Ext.isReady = false;
    },

    /**
     * Sorts the `listeners` array by `phase` and `priority` such that the first listener
     * to fire can be determined using `pop` on the `listeners` array.
     * @private
     */
    sortFn: function (a, b) {
        return -((a.phase - b.phase) || (b.priority - a.priority) || (a.id - b.id));
    },

    unblock: function () {
        var me = this;
        if (me.blocks) {
            --me.blocks;
        }
    },

};
