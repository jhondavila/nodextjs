Ext.data.JsonP.Nodext_database_query_Protect({"tagname":"class","name":"Nodext.database.query.Protect","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true},"files":[{"filename":"Protect.js","href":"Protect.html#Nodext-database-query-Protect"}],"aliases":{},"alternateClassNames":[],"extends":"Ext.Mixin","mixins":[],"requires":[],"uses":[],"members":[{"name":"dbprefix","tagname":"cfg","owner":"Nodext.database.query.Protect","id":"cfg-dbprefix","meta":{}},{"name":"escapeChar","tagname":"cfg","owner":"Nodext.database.query.Protect","id":"cfg-escapeChar","meta":{}},{"name":"likeEscapeChr","tagname":"cfg","owner":"Nodext.database.query.Protect","id":"cfg-likeEscapeChr","meta":{}},{"name":"likeEscapeStr","tagname":"cfg","owner":"Nodext.database.query.Protect","id":"cfg-likeEscapeStr","meta":{}},{"name":"protectIdentifiers","tagname":"cfg","owner":"Nodext.database.query.Protect","id":"cfg-protectIdentifiers","meta":{}},{"name":"reservedIdentifiers","tagname":"cfg","owner":"Nodext.database.query.Protect","id":"cfg-reservedIdentifiers","meta":{}},{"name":"$configPrefixed","tagname":"property","owner":"Nodext.database.query.Protect","id":"property-S-configPrefixed","meta":{"private":true}},{"name":"findOperators","tagname":"property","owner":"Nodext.database.query.Protect","id":"property-findOperators","meta":{}},{"name":"_escape_identifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-_escape_identifiers","meta":{"deprecated":{"text":"\n"},"private":true}},{"name":"_escape_str","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-_escape_str","meta":{"private":true}},{"name":"_get_operator","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-_get_operator","meta":{"private":true}},{"name":"_has_operator","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-_has_operator","meta":{"private":true}},{"name":"escape","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-escape","meta":{"private":true}},{"name":"escape_identifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-escape_identifiers","meta":{"private":true}},{"name":"escape_like_str","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-escape_like_str","meta":{"private":true}},{"name":"escape_str","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-escape_str","meta":{"private":true}},{"name":"getDbprefix","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-getDbprefix","meta":{}},{"name":"getEscapeChar","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-getEscapeChar","meta":{}},{"name":"getLikeEscapeChr","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-getLikeEscapeChr","meta":{}},{"name":"getLikeEscapeStr","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-getLikeEscapeStr","meta":{}},{"name":"getProtectIdentifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-getProtectIdentifiers","meta":{}},{"name":"getReservedIdentifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-getReservedIdentifiers","meta":{}},{"name":"protect_identifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-protect_identifiers","meta":{"private":true}},{"name":"remove_invisible_characters","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-remove_invisible_characters","meta":{"private":true}},{"name":"setDbprefix","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-setDbprefix","meta":{}},{"name":"setEscapeChar","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-setEscapeChar","meta":{}},{"name":"setLikeEscapeChr","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-setLikeEscapeChr","meta":{}},{"name":"setLikeEscapeStr","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-setLikeEscapeStr","meta":{}},{"name":"setProtectIdentifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-setProtectIdentifiers","meta":{}},{"name":"setReservedIdentifiers","tagname":"method","owner":"Nodext.database.query.Protect","id":"method-setReservedIdentifiers","meta":{}}],"code_type":"ext_define","id":"class-Nodext.database.query.Protect","component":false,"superclasses":["Ext.Mixin"],"subclasses":[],"mixedInto":["Nodext.database.query.Base"],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/Ext.Mixin' rel='Ext.Mixin' class='docClass'>Ext.Mixin</a><div class='subclass '><strong>Nodext.database.query.Protect</strong></div></div><h4>Mixed into</h4><div class='dependency'><a href='#!/api/Nodext.database.query.Base' rel='Nodext.database.query.Base' class='docClass'>Nodext.database.query.Base</a></div><h4>Files</h4><div class='dependency'><a href='source/Protect.html#Nodext-database-query-Protect' target='_blank'>Protect.js</a></div></pre><div class='doc-contents'>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-dbprefix' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-dbprefix' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-cfg-dbprefix' class='name expandable'>dbprefix</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;&#39;</code></p></div></div></div><div id='cfg-escapeChar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-escapeChar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-cfg-escapeChar' class='name expandable'>escapeChar</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;&quot;&#39;</code></p></div></div></div><div id='cfg-likeEscapeChr' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-likeEscapeChr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-cfg-likeEscapeChr' class='name expandable'>likeEscapeChr</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;!&#39;</code></p></div></div></div><div id='cfg-likeEscapeStr' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-likeEscapeStr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-cfg-likeEscapeStr' class='name expandable'>likeEscapeStr</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&quot; ESCAPE &#39;{0}&#39; &quot;</code></p></div></div></div><div id='cfg-protectIdentifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-protectIdentifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-cfg-protectIdentifiers' class='name expandable'>protectIdentifiers</a> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-reservedIdentifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-reservedIdentifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-cfg-reservedIdentifiers' class='name expandable'>reservedIdentifiers</a> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>[&#39;*&#39;]</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-S-configPrefixed' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-property-S-configPrefixed' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-property-S-configPrefixed' class='name expandable'>$configPrefixed</a> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>false</code></p><p>Overrides: <a href=\"#!/api/Nodext.database.query.Util-property-S-configPrefixed\" rel=\"Nodext.database.query.Util-property-S-configPrefixed\" class=\"docClass\">Nodext.database.query.Util.$configPrefixed</a></p></div></div></div><div id='property-findOperators' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-property-findOperators' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-property-findOperators' class='name expandable'>findOperators</a> : <a href=\"#!/api/RegExp\" rel=\"RegExp\" class=\"docClass\">RegExp</a>[]<span class=\"signature\"></span></div><div class='description'><div class='short'>Lista de Operadores a interceptar por la clausula where:\n\n\n/\\s*(?:&lt;|&gt;|!)?=\\s*'/i, // =, &lt;=, &gt;=, !=\n/\\s*&l...</div><div class='long'><p>Lista de Operadores a interceptar por la clausula where:</p>\n\n<ul>\n<li><code>/\\s*(?:&lt;|&gt;|!)?=\\s*'/i, // =, &lt;=, &gt;=, !=</code></li>\n<li><code>/\\s*&lt;&gt;?\\s*'/i, // &lt;, &lt;&gt;</code></li>\n<li><code>/\\s*&gt;\\s*'/i, // &gt;</code></li>\n<li><code>/\\s+IS NULL'/i, // IS NULL</code></li>\n<li><code>/\\s+IS NOT NULL'/i, // IS NOT NULL</code></li>\n<li><code>/\\s+EXISTS\\s*\\([^\\)]+\\)/i, // EXISTS(sql)</code></li>\n<li><code>/\\s+NOT EXISTS\\s*\\([^\\)]+\\)/i, // NOT EXISTS(sql)</code></li>\n<li><code>/\\s+BETWEEN\\s+\\S+\\s+AND\\s+\\S+/i, // BETWEEN value AND value</code></li>\n<li><code>/\\s+IN\\s*\\([^\\)]+\\)/i, // IN(list)</code></li>\n<li><code>/\\s+NOT IN\\s*\\([^\\)]+\\)/i, // NOT IN (list)</code></li>\n</ul>\n\n<p>Defaults to: <code>[/\\s*(?:&lt;|&gt;|!)?=\\s*&#39;/i, /\\s*&lt;&gt;?\\s*&#39;/i, /\\s*&gt;\\s*&#39;/i, /\\s+IS NULL&#39;/i, /\\s+IS NOT NULL&#39;/i, /\\s+EXISTS\\s*\\([^\\)]+\\)/i, /\\s+NOT EXISTS\\s*\\([^\\)]+\\)/i, /\\s+BETWEEN\\s+\\S+\\s+AND\\s+\\S+/i, /\\s+IN\\s*\\([^\\)]+\\)/i, /\\s+NOT IN\\s*\\([^\\)]+\\)/i]</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-_escape_identifiers' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-_escape_identifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-_escape_identifiers' class='name expandable'>_escape_identifiers</a>( <span class='pre'>item</span> )<span class=\"signature\"><span class='deprecated' >deprecated</span><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n        <div class='rounded-box deprecated-box deprecated-tag-box'>\n        <p>This method has been <strong>deprected</strong> </p>\n        \n\n        </div>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-_escape_str' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-_escape_str' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-_escape_str' class='name expandable'>_escape_str</a>( <span class='pre'>str</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-_get_operator' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-_get_operator' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-_get_operator' class='name expandable'>_get_operator</a>( <span class='pre'>str</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-_has_operator' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-_has_operator' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-_has_operator' class='name expandable'>_has_operator</a>( <span class='pre'>str</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-escape' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-escape' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-escape' class='name expandable'>escape</a>( <span class='pre'>str</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-escape_identifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-escape_identifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-escape_identifiers' class='name expandable'>escape_identifiers</a>( <span class='pre'>item, isAlias</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>isAlias</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-escape_like_str' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-escape_like_str' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-escape_like_str' class='name expandable'>escape_like_str</a>( <span class='pre'>str</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-escape_str' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-escape_str' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-escape_str' class='name expandable'>escape_str</a>( <span class='pre'>str, like</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>like</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-getDbprefix' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-dbprefix' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-getDbprefix' class='name expandable'>getDbprefix</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of dbprefix. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-dbprefix\" rel=\"Nodext.database.query.Protect-cfg-dbprefix\" class=\"docClass\">dbprefix</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getEscapeChar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-escapeChar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-getEscapeChar' class='name expandable'>getEscapeChar</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of escapeChar. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-escapeChar\" rel=\"Nodext.database.query.Protect-cfg-escapeChar\" class=\"docClass\">escapeChar</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getLikeEscapeChr' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-likeEscapeChr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-getLikeEscapeChr' class='name expandable'>getLikeEscapeChr</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of likeEscapeChr. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-likeEscapeChr\" rel=\"Nodext.database.query.Protect-cfg-likeEscapeChr\" class=\"docClass\">likeEscapeChr</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getLikeEscapeStr' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-likeEscapeStr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-getLikeEscapeStr' class='name expandable'>getLikeEscapeStr</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of likeEscapeStr. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-likeEscapeStr\" rel=\"Nodext.database.query.Protect-cfg-likeEscapeStr\" class=\"docClass\">likeEscapeStr</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getProtectIdentifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-protectIdentifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-getProtectIdentifiers' class='name expandable'>getProtectIdentifiers</a>( <span class='pre'></span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of protectIdentifiers. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-protectIdentifiers\" rel=\"Nodext.database.query.Protect-cfg-protectIdentifiers\" class=\"docClass\">protectIdentifiers</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getReservedIdentifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-reservedIdentifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-getReservedIdentifiers' class='name expandable'>getReservedIdentifiers</a>( <span class='pre'></span> ) : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of reservedIdentifiers. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-reservedIdentifiers\" rel=\"Nodext.database.query.Protect-cfg-reservedIdentifiers\" class=\"docClass\">reservedIdentifiers</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-protect_identifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-protect_identifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-protect_identifiers' class='name expandable'>protect_identifiers</a>( <span class='pre'>QBI, item, prefix_single, protect_identifiers, field_exists</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>QBI</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>item</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>prefix_single</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>protect_identifiers</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>field_exists</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-remove_invisible_characters' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-method-remove_invisible_characters' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-remove_invisible_characters' class='name expandable'>remove_invisible_characters</a>( <span class='pre'>str, url_encoded</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>url_encoded</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-setDbprefix' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-dbprefix' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-setDbprefix' class='name expandable'>setDbprefix</a>( <span class='pre'>dbprefix</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of dbprefix. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-dbprefix\" rel=\"Nodext.database.query.Protect-cfg-dbprefix\" class=\"docClass\">dbprefix</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>dbprefix</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setEscapeChar' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-escapeChar' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-setEscapeChar' class='name expandable'>setEscapeChar</a>( <span class='pre'>escapeChar</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of escapeChar. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-escapeChar\" rel=\"Nodext.database.query.Protect-cfg-escapeChar\" class=\"docClass\">escapeChar</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>escapeChar</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setLikeEscapeChr' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-likeEscapeChr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-setLikeEscapeChr' class='name expandable'>setLikeEscapeChr</a>( <span class='pre'>likeEscapeChr</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of likeEscapeChr. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-likeEscapeChr\" rel=\"Nodext.database.query.Protect-cfg-likeEscapeChr\" class=\"docClass\">likeEscapeChr</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>likeEscapeChr</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setLikeEscapeStr' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-likeEscapeStr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-setLikeEscapeStr' class='name expandable'>setLikeEscapeStr</a>( <span class='pre'>likeEscapeStr</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of likeEscapeStr. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-likeEscapeStr\" rel=\"Nodext.database.query.Protect-cfg-likeEscapeStr\" class=\"docClass\">likeEscapeStr</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>likeEscapeStr</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setProtectIdentifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-protectIdentifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-setProtectIdentifiers' class='name expandable'>setProtectIdentifiers</a>( <span class='pre'>protectIdentifiers</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of protectIdentifiers. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-protectIdentifiers\" rel=\"Nodext.database.query.Protect-cfg-protectIdentifiers\" class=\"docClass\">protectIdentifiers</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>protectIdentifiers</span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setReservedIdentifiers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Nodext.database.query.Protect'>Nodext.database.query.Protect</span><br/><a href='source/Protect.html#Nodext-database-query-Protect-cfg-reservedIdentifiers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Nodext.database.query.Protect-method-setReservedIdentifiers' class='name expandable'>setReservedIdentifiers</a>( <span class='pre'>reservedIdentifiers</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of reservedIdentifiers. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/Nodext.database.query.Protect-cfg-reservedIdentifiers\" rel=\"Nodext.database.query.Protect-cfg-reservedIdentifiers\" class=\"docClass\">reservedIdentifiers</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>reservedIdentifiers</span> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});