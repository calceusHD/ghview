function Enum() {
    for (var i in arguments) {
        this[arguments[i]] = Number(i);
    }
    return this;
}

rtik = new Enum("top", "library", "package", "package_body", "entity", "architecture", "process", "block", "if_generate", "for_generate", "instance", "constant", "iterator", "variable", "signal", "file", "port", "generic", "alias", "guard", "component", "attribute", "type_b2", "type_e8", "type_e32", "type_i32", "type_i64", "type_f64", "type_p32", "type_p64", "type_access", "type_array", "type_record", "type_file", "subtype_scalar", "subtype_array", "subtype_array_ptr", "subtype_unconstrained_array", "subtype_record", "subtype_access", "type_protected", "element", "unit", "attribute_transaction", "attribute_quiet", "attribute_stable", "error");
Object.freeze(rtik);
wkt_type = new Enum("unknown", "boolean", "bit", "std_ulogic");
Object.freeze(wkt_type);
hie_kind = {"eoh": 0, "design": 1, "block": 3, "generate_if": 4, "generate_for": 5, "instance": 6, "package": 7, "process": 13, "generic": 14, "eos": 15, "signal": 16, "port_in": 17, "port_out": 18, "port_inout": 19, "port_buffer": 20, "port_linkage": 21};
Object.freeze(hie_kind);
sm_type = new Enum("init", "sect", "cycle");
Object.freeze(sm_type);