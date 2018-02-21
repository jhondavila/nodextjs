/**
 * 
 */
Nodext.define("Nodext.app.master.ClusterManager", {
    extend: "Ext.Base",
    alternateClassName: ["Nodext.app.ClusterMgr"],
    singleton: true,
    clusters: Nodext.create("Ext.util.Collection"),
    register: function (cluster) {
        if (this.clusters.getByKey(cluster.id)) {
            Nodext.logWarn("Advertencia: id Cluster duplicado,generando nuevo Id.");
            cluster.generateId();
        } else if (!cluster.id) {
            cluster.generateId();
        }
        this.clusters.add(cluster);
    }
});