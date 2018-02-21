/**
 * 
 */
Nodext.define("Nodext.database.postgre.Connection", {
    extend: "Nodext.database.Connection",
    alias: "dbconnection.postgre",
    dbdriver: "postgre",
    driver: null,
    config: {
        /**
        * Cadena de conexion
        */
        strCon: "",
        singlePool: null
    },
    constructor: function () {
        this.callParent(arguments);
        this.driver = require("pg");
        this.generateStringConnection();
        if (this.type === "pool") {
            this.singlePool = new this.driver.Pool({
                connectionString: this.strCon
            })
            this.newCnx = this.newPoolCnx;
        } else {
            this.newCnx = this.newClientCnx;
        }
        Nodext.db.Manager.addListCnx(this.nameConnection || this.database, this);
        this.qb = this.qb || {};
        if (!(this.qb instanceof Nodext.database.query.Builder)) {
            Nodext.apply(this.qb, {
                type: this.dbdriver
            });
            this.qb = Nodext.database.query.Builder.create(this.qb);
        }
    },
    generateStringConnection: function () {
        this.strCon = Ext.String.format("postgres://{0}:{1}@{2}/{3}", this.username, this.password, this.hostname, this.database);
    },
    newPoolCnx: function () {
        return Nodext.create("Nodext.database.postgre.Pool", {
            cnx: this.singlePool,
            strCon: this.strCon,
            connection: this
        });
    },
    newClientCnx: function () {
        return Nodext.create("Nodext.database.postgre.Client", {
            connection: this,
            cnx: this.newClientInst()
        });
    },
    newClientInst: function () {
        return new this.driver.Client(this.strCon);
    },
    sendQueryError: function (inst, query, err) {

        var message = this.getMessageError(err) || {};
        var data = {
            success: false,
            message: message.text || "Database Query Error",
        };

        if (this.debug) {
            data["query"] = query;
            data["error"] = err;
        }
        inst.sendError(data, 500, true);
    },
    sendConnectionError: function (inst, err) {
        var data = {
            success: false,
            message: "Database connection error",
        };
        if (this.debug) {
            data["error"] = err;
        }
        inst.sendError(data, 500, true);
    },
    sendCallbackError: function (inst, err) {
        var data = {
            success: false,
            message: "Error Code in Function Callback",
        };
        if (this.debug) {
            data["error"] = {
                name: err.name,
                message: err.message,
                stack: err.stack
            };
            data["query"] = "Error in Nodext \n" + err.stack;
        }
        inst.sendError(data, 500, true);
    },
    errorGroupCode: {
        '1': { group: 'Class 00 — Successful Completion' },
        '2': { group: 'Class 01 — Warning' },
        '3': { group: 'Class 02 — No Data (this is also a warning class per the SQL standard)' },
        '4': { group: 'Class 03 — SQL Statement Not Yet Complete' },
        '5': { group: 'Class 08 — Connection Exception' },
        '6': { group: 'Class 09 — Triggered Action Exception' },
        '7': { group: 'Class 0A — Feature Not Supported' },
        '8': { group: 'Class 0B — Invalid Transaction Initiation' },
        '9': { group: 'Class 0F — Locator Exception' },
        '10': { group: 'Class 0L — Invalid Grantor' },
        '11': { group: 'Class 0P — Invalid Role Specification' },
        '12': { group: 'Class 0Z — Diagnostics Exception' },
        '13': { group: 'Class 20 — Case Not Found' },
        '14': { group: 'Class 21 — Cardinality Violation' },
        '15': { group: 'Class 22 — Data Exception' },
        '16': { group: 'Class 23 — Integrity Constraint Violation' },
        '17': { group: 'Class 24 — Invalid Cursor State' },
        '18': { group: 'Class 25 — Invalid Transaction State' },
        '19': { group: 'Class 26 — Invalid SQL Statement Name' },
        '20': { group: 'Class 27 — Triggered Data Change Violation' },
        '21': { group: 'Class 28 — Invalid Authorization Specification' },
        '22': { group: 'Class 2B — Dependent Privilege Descriptors Still Exist' },
        '23': { group: 'Class 2D — Invalid Transaction Termination' },
        '24': { group: 'Class 2F — SQL Routine Exception' },
        '25': { group: 'Class 34 — Invalid Cursor Name' },
        '26': { group: 'Class 38 — External Routine Exception' },
        '27': { group: 'Class 39 — External Routine Invocation Exception' },
        '28': { group: 'Class 3B — Savepoint Exception' },
        '29': { group: 'Class 3D — Invalid Catalog Name' },
        '30': { group: 'Class 3F — Invalid Schema Name' },
        '31': { group: 'Class 40 — Transaction Rollback' },
        '32': { group: 'Class 42 — Syntax Error or Access Rule Violation' },
        '33': { group: 'Class 44 — WITH CHECK OPTION Violation' },
        '34': { group: 'Class 53 — Insufficient Resources' },
        '35': { group: 'Class 54 — Program Limit Exceeded' },
        '36': { group: 'Class 55 — Object Not In Prerequisite State' },
        '37': { group: 'Class 57 — Operator Intervention' },
        '38': { group: 'Class 58 — System Error (errors external to PostgreSQL itself)' },
        '39': { group: 'Class F0 — Configuration File Error' },
        '40': { group: 'Class HV — Foreign Data Wrapper Error (SQL/MED)' },
        '41': { group: 'Class P0 — PL/pgSQL Error' },
        '42': { group: 'Class XX — Internal Error' }
    },
    errorCode: {
        '00000': { group: 1, message: 'successful_completion' },
        '01000': { group: 2, message: 'warning' },
        '0100C': { group: 2, message: 'dynamic_result_sets_returned' },
        '01008': { group: 2, message: 'implicit_zero_bit_padding' },
        '01003': { group: 2, message: 'null_value_eliminated_in_set_function' },
        '01007': { group: 2, message: 'privilege_not_granted' },
        '01006': { group: 2, message: 'privilege_not_revoked' },
        '01004': { group: 2, message: 'string_data_right_truncation' },
        '01P01': { group: 2, message: 'deprecated_feature' },
        '02000': { group: 3, message: 'no_data' },
        '02001': { group: 3, message: 'no_additional_dynamic_result_sets_returned' },
        '03000': { group: 4, message: 'sql_statement_not_yet_complete' },
        '08000': { group: 5, message: 'connection_exception' },
        '08003': { group: 5, message: 'connection_does_not_exist' },
        '08006': { group: 5, message: 'connection_failure' },
        '08001': { group: 5, message: 'sqlclient_unable_to_establish_sqlconnection' },
        '08004': { group: 5, message: 'sqlserver_rejected_establishment_of_sqlconnection' },
        '08007': { group: 5, message: 'transaction_resolution_unknown' },
        '08P01': { group: 5, message: 'protocol_violation' },
        '09000': { group: 6, message: 'triggered_action_exception' },
        '0A000': { group: 7, message: 'feature_not_supported' },
        '0B000': { group: 8, message: 'invalid_transaction_initiation' },
        '0F000': { group: 9, message: 'locator_exception' },
        '0F001': { group: 9, message: 'invalid_locator_specification' },
        '0L000': { group: 10, message: 'invalid_grantor' },
        '0LP01': { group: 10, message: 'invalid_grant_operation' },
        '0P000': { group: 11, message: 'invalid_role_specification' },
        '0Z000': { group: 12, message: 'diagnostics_exception' },
        '0Z002': { group: 12, message: 'stacked_diagnostics_accessed_without_active_handler' },
        '20000': { group: 13, message: 'case_not_found' },
        '21000': { group: 14, message: 'cardinality_violation' },
        '22000': { group: 15, message: 'data_exception' },
        '2202E': { group: 15, message: 'array_subscript_error' },
        '22021': { group: 15, message: 'character_not_in_repertoire' },
        '22008': { group: 15, message: 'datetime_field_overflow' },
        '22012': { group: 15, message: 'division_by_zero' },
        '22005': { group: 15, message: 'error_in_assignment' },
        '2200B': { group: 15, message: 'escape_character_conflict' },
        '22022': { group: 15, message: 'indicator_overflow' },
        '22015': { group: 15, message: 'interval_field_overflow' },
        '2201E': { group: 15, message: 'invalid_argument_for_logarithm' },
        '22014': { group: 15, message: 'invalid_argument_for_ntile_function' },
        '22016': { group: 15, message: 'invalid_argument_for_nth_value_function' },
        '2201F': { group: 15, message: 'invalid_argument_for_power_function' },
        '2201G': { group: 15, message: 'invalid_argument_for_width_bucket_function' },
        '22018': { group: 15, message: 'invalid_character_value_for_cast' },
        '22007': { group: 15, message: 'invalid_datetime_format' },
        '22019': { group: 15, message: 'invalid_escape_character' },
        '2200D': { group: 15, message: 'invalid_escape_octet' },
        '22025': { group: 15, message: 'invalid_escape_sequence' },
        '22P06': { group: 15, message: 'nonstandard_use_of_escape_character' },
        '22010': { group: 15, message: 'invalid_indicator_parameter_value' },
        '22023': { group: 15, message: 'invalid_parameter_value' },
        '2201B': { group: 15, message: 'invalid_regular_expression' },
        '2201W': { group: 15, message: 'invalid_row_count_in_limit_clause' },
        '2201X': { group: 15, message: 'invalid_row_count_in_result_offset_clause' },
        '2202H': { group: 15, message: 'invalid_tablesample_argument' },
        '2202G': { group: 15, message: 'invalid_tablesample_repeat' },
        '22009': { group: 15, message: 'invalid_time_zone_displacement_value' },
        '2200C': { group: 15, message: 'invalid_use_of_escape_character' },
        '2200G': { group: 15, message: 'most_specific_type_mismatch' },
        '22004': { group: 15, message: 'null_value_not_allowed' },
        '22002': { group: 15, message: 'null_value_no_indicator_parameter' },
        '22003': { group: 15, message: 'numeric_value_out_of_range' },
        '22026': { group: 15, message: 'string_data_length_mismatch' },
        '22001': { group: 15, message: 'string_data_right_truncation' },
        '22011': { group: 15, message: 'substring_error' },
        '22027': { group: 15, message: 'trim_error' },
        '22024': { group: 15, message: 'unterminated_c_string' },
        '2200F': { group: 15, message: 'zero_length_character_string' },
        '22P01': { group: 15, message: 'floating_point_exception' },
        '22P02': { group: 15, message: 'invalid_text_representation' },
        '22P03': { group: 15, message: 'invalid_binary_representation' },
        '22P04': { group: 15, message: 'bad_copy_file_format' },
        '22P05': { group: 15, message: 'untranslatable_character' },
        '2200L': { group: 15, message: 'not_an_xml_document' },
        '2200M': { group: 15, message: 'invalid_xml_document' },
        '2200N': { group: 15, message: 'invalid_xml_content' },
        '2200S': { group: 15, message: 'invalid_xml_comment' },
        '2200T': { group: 15, message: 'invalid_xml_processing_instruction' },
        '23000': { group: 16, message: 'integrity_constraint_violation' },
        '23001': { group: 16, message: 'restrict_violation' },
        '23502': { group: 16, message: 'not_null_violation' },
        '23503': { group: 16, message: 'foreign_key_violation' },
        '23505': { group: 16, message: 'unique_violation' },
        '23514': { group: 16, message: 'check_violation' },
        '23P01': { group: 16, message: 'exclusion_violation' },
        '24000': { group: 17, message: 'invalid_cursor_state' },
        '25000': { group: 18, message: 'invalid_transaction_state' },
        '25001': { group: 18, message: 'active_sql_transaction' },
        '25002': { group: 18, message: 'branch_transaction_already_active' },
        '25008': { group: 18, message: 'held_cursor_requires_same_isolation_level' },
        '25003': { group: 18, message: 'inappropriate_access_mode_for_branch_transaction' },
        '25004': { group: 18, message: 'inappropriate_isolation_level_for_branch_transaction' },
        '25005': { group: 18, message: 'no_active_sql_transaction_for_branch_transaction' },
        '25006': { group: 18, message: 'read_only_sql_transaction' },
        '25007': { group: 18, message: 'schema_and_data_statement_mixing_not_supported' },
        '25P01': { group: 18, message: 'no_active_sql_transaction' },
        '25P02': { group: 18, message: 'in_failed_sql_transaction' },
        '26000': { group: 19, message: 'invalid_sql_statement_name' },
        '27000': { group: 20, message: 'triggered_data_change_violation' },
        '28000': { group: 21, message: 'invalid_authorization_specification' },
        '28P01': { group: 21, message: 'invalid_password' },
        '2B000': { group: 22, message: 'dependent_privilege_descriptors_still_exist' },
        '2BP01': { group: 22, message: 'dependent_objects_still_exist' },
        '2D000': { group: 23, message: 'invalid_transaction_termination' },
        '2F000': { group: 24, message: 'sql_routine_exception' },
        '2F005': { group: 24, message: 'function_executed_no_return_statement' },
        '2F002': { group: 24, message: 'modifying_sql_data_not_permitted' },
        '2F003': { group: 24, message: 'prohibited_sql_statement_attempted' },
        '2F004': { group: 24, message: 'reading_sql_data_not_permitted' },
        '34000': { group: 25, message: 'invalid_cursor_name' },
        '38000': { group: 26, message: 'external_routine_exception' },
        '38001': { group: 26, message: 'containing_sql_not_permitted' },
        '38002': { group: 26, message: 'modifying_sql_data_not_permitted' },
        '38003': { group: 26, message: 'prohibited_sql_statement_attempted' },
        '38004': { group: 26, message: 'reading_sql_data_not_permitted' },
        '39000': { group: 27, message: 'external_routine_invocation_exception' },
        '39001': { group: 27, message: 'invalid_sqlstate_returned' },
        '39004': { group: 27, message: 'null_value_not_allowed' },
        '39P01': { group: 27, message: 'trigger_protocol_violated' },
        '39P02': { group: 27, message: 'srf_protocol_violated' },
        '39P03': { group: 27, message: 'event_trigger_protocol_violated' },
        '3B000': { group: 28, message: 'savepoint_exception' },
        '3B001': { group: 28, message: 'invalid_savepoint_specification' },
        '3D000': { group: 29, message: 'invalid_catalog_name' },
        '3F000': { group: 30, message: 'invalid_schema_name' },
        '40000': { group: 31, message: 'transaction_rollback' },
        '40002': { group: 31, message: 'transaction_integrity_constraint_violation' },
        '40001': { group: 31, message: 'serialization_failure' },
        '40003': { group: 31, message: 'statement_completion_unknown' },
        '40P01': { group: 31, message: 'deadlock_detected' },
        '42000': { group: 32, message: 'syntax_error_or_access_rule_violation' },
        '42601': { group: 32, message: 'syntax_error' },
        '42501': { group: 32, message: 'insufficient_privilege' },
        '42846': { group: 32, message: 'cannot_coerce' },
        '42803': { group: 32, message: 'grouping_error' },
        '42P20': { group: 32, message: 'windowing_error' },
        '42P19': { group: 32, message: 'invalid_recursion' },
        '42830': { group: 32, message: 'invalid_foreign_key' },
        '42602': { group: 32, message: 'invalid_name' },
        '42622': { group: 32, message: 'name_too_long' },
        '42939': { group: 32, message: 'reserved_name' },
        '42804': { group: 32, message: 'datatype_mismatch' },
        '42P18': { group: 32, message: 'indeterminate_datatype' },
        '42P21': { group: 32, message: 'collation_mismatch' },
        '42P22': { group: 32, message: 'indeterminate_collation' },
        '42809': { group: 32, message: 'wrong_object_type' },
        '42703': { group: 32, message: 'undefined_column' },
        '42883': { group: 32, message: 'undefined_function' },
        '42P01': { group: 32, message: 'undefined_table' },
        '42P02': { group: 32, message: 'undefined_parameter' },
        '42704': { group: 32, message: 'undefined_object' },
        '42701': { group: 32, message: 'duplicate_column' },
        '42P03': { group: 32, message: 'duplicate_cursor' },
        '42P04': { group: 32, message: 'duplicate_database' },
        '42723': { group: 32, message: 'duplicate_function' },
        '42P05': { group: 32, message: 'duplicate_prepared_statement' },
        '42P06': { group: 32, message: 'duplicate_schema' },
        '42P07': { group: 32, message: 'duplicate_table' },
        '42712': { group: 32, message: 'duplicate_alias' },
        '42710': { group: 32, message: 'duplicate_object' },
        '42702': { group: 32, message: 'ambiguous_column' },
        '42725': { group: 32, message: 'ambiguous_function' },
        '42P08': { group: 32, message: 'ambiguous_parameter' },
        '42P09': { group: 32, message: 'ambiguous_alias' },
        '42P10': { group: 32, message: 'invalid_column_reference' },
        '42611': { group: 32, message: 'invalid_column_definition' },
        '42P11': { group: 32, message: 'invalid_cursor_definition' },
        '42P12': { group: 32, message: 'invalid_database_definition' },
        '42P13': { group: 32, message: 'invalid_function_definition' },
        '42P14': { group: 32, message: 'invalid_prepared_statement_definition' },
        '42P15': { group: 32, message: 'invalid_schema_definition' },
        '42P16': { group: 32, message: 'invalid_table_definition' },
        '42P17': { group: 32, message: 'invalid_object_definition' },
        '44000': { group: 33, message: 'with_check_option_violation' },
        '53000': { group: 34, message: 'insufficient_resources' },
        '53100': { group: 34, message: 'disk_full' },
        '53200': { group: 34, message: 'out_of_memory' },
        '53300': { group: 34, message: 'too_many_connections' },
        '53400': { group: 34, message: 'configuration_limit_exceeded' },
        '54000': { group: 35, message: 'program_limit_exceeded' },
        '54001': { group: 35, message: 'statement_too_complex' },
        '54011': { group: 35, message: 'too_many_columns' },
        '54023': { group: 35, message: 'too_many_arguments' },
        '55000': { group: 36, message: 'object_not_in_prerequisite_state' },
        '55006': { group: 36, message: 'object_in_use' },
        '55P02': { group: 36, message: 'cant_change_runtime_param' },
        '55P03': { group: 36, message: 'lock_not_available' },
        '57000': { group: 37, message: 'operator_intervention' },
        '57014': { group: 37, message: 'query_canceled' },
        '57P01': { group: 37, message: 'admin_shutdown' },
        '57P02': { group: 37, message: 'crash_shutdown' },
        '57P03': { group: 37, message: 'cannot_connect_now' },
        '57P04': { group: 37, message: 'database_dropped' },
        '58000': { group: 38, message: 'system_error' },
        '58030': { group: 38, message: 'io_error' },
        '58P01': { group: 38, message: 'undefined_file' },
        '58P02': { group: 38, message: 'duplicate_file' },
        'F0000': { group: 39, message: 'config_file_error' },
        'F0001': { group: 39, message: 'lock_file_exists' },
        'HV000': { group: 40, message: 'fdw_error' },
        'HV005': { group: 40, message: 'fdw_column_name_not_found' },
        'HV002': { group: 40, message: 'fdw_dynamic_parameter_value_needed' },
        'HV010': { group: 40, message: 'fdw_function_sequence_error' },
        'HV021': { group: 40, message: 'fdw_inconsistent_descriptor_information' },
        'HV024': { group: 40, message: 'fdw_invalid_attribute_value' },
        'HV007': { group: 40, message: 'fdw_invalid_column_name' },
        'HV008': { group: 40, message: 'fdw_invalid_column_number' },
        'HV004': { group: 40, message: 'fdw_invalid_data_type' },
        'HV006': { group: 40, message: 'fdw_invalid_data_type_descriptors' },
        'HV091': { group: 40, message: 'fdw_invalid_descriptor_field_identifier' },
        'HV00B': { group: 40, message: 'fdw_invalid_handle' },
        'HV00C': { group: 40, message: 'fdw_invalid_option_index' },
        'HV00D': { group: 40, message: 'fdw_invalid_option_name' },
        'HV090': { group: 40, message: 'fdw_invalid_string_length_or_buffer_length' },
        'HV00A': { group: 40, message: 'fdw_invalid_string_format' },
        'HV009': { group: 40, message: 'fdw_invalid_use_of_null_pointer' },
        'HV014': { group: 40, message: 'fdw_too_many_handles' },
        'HV001': { group: 40, message: 'fdw_out_of_memory' },
        'HV00P': { group: 40, message: 'fdw_no_schemas' },
        'HV00J': { group: 40, message: 'fdw_option_name_not_found' },
        'HV00K': { group: 40, message: 'fdw_reply_handle' },
        'HV00Q': { group: 40, message: 'fdw_schema_not_found' },
        'HV00R': { group: 40, message: 'fdw_table_not_found' },
        'HV00L': { group: 40, message: 'fdw_unable_to_create_execution' },
        'HV00M': { group: 40, message: 'fdw_unable_to_create_reply' },
        'HV00N': { group: 40, message: 'fdw_unable_to_establish_connection' },
        'P0000': { group: 41, message: 'plpgsql_error' },
        'P0001': { group: 41, message: 'raise_exception' },
        'P0002': { group: 41, message: 'no_data_found' },
        'P0003': { group: 41, message: 'too_many_rows' },
        'P0004': { group: 41, message: 'assert_failure' },
        'XX000': { group: 42, message: 'internal_error' },
        'XX001': { group: 42, message: 'data_corrupted' },
        'XX002': { group: 42, message: 'index_corrupted' }
    },
    getCodeErrorBase: function (id) {
        return this.errorCode[id];
    },
    getCodeError: function (id) {
        var obj = {
            group: "",
            message: "",
            code: id
        };
        if (this.errorCode[id]) {
            Nodext.apply(obj, this.errorCode[id] || {});
            Nodext.apply(obj, this.errorGroupCode[obj.group || ''] || {});
        }
        return obj;
    },
    errorByTableUndefined: function (id) {
        if (Nodext.Array.contains(['42P01', '3F000'], id)) {
            return true;
        } else {
            return false;
        }
    },
    getMessageError: function (err) {
        if (err.code === '23505') {
            return this.getEUniqueViolation(err);
        }
        return null;
    },
    getEUniqueViolation: function (err) {
        var data;
        if (err.detail && (data = /\(.*\)/i.exec(err.detail))) {
            data = data[0].split("=");
            data[0] = data[0].substring(1, data[0].length - 1);
            data[1] = data[1].substring(1, data[1].length - 1);
            return {
                key: data[0],
                value: data[1],
                type: "unique_violation",
                text: Nodext.String.format("El valor {0} ya existe en el campo {1}", data[1], data[0])
            };
        }
        data = null;
        return null;
    }
});