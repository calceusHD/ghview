
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
    
ghw = (function() {
    var self = {};
    self.open_ghw = function(data, rv) {
        var hdr = data.read(16);
        if ("GHDLwave\n" != hdr.substring(0, 9)) {
            return -1;
        }
        if (hdr.charCodeAt(9) != 16 || hdr.charCodeAt(10) != 0) {
            return -1;
        }
        rv.version = hdr.charCodeAt(11);
        if (rv.version > 1) {
            return -1;
        }
        if (hdr.charCodeAt(12) == 1) {
            rv.word_be = 0;
        } else if (hdr.charCodeAt(12) = 2) {
            rv.word_be = 1;
        } else {
            return -1;
        }
        rv.word_len = hdr.charCodeAt(13);
        rv.off_len = hdr.charCodeAt(14);
        if (hdr.charCodeAt(15) != 0) {
            return -1;
        }
        return 16;
    };

    self.get_i32 = function(handler, data) {
        if (handler.word_be) {
            return (data.charCodeAt(0) << 24) | (data.charCodeAt(1) << 16) | (data.charCodeAt(2) << 8) | (data.charCodeAt(3) << 0);
        } else {
            return (data.charCodeAt(3) << 24) | (data.charCodeAt(2) << 16) | (data.charCodeAt(1) << 8) | (data.charCodeAt(0) << 0);
        }
    };

    self.get_i64 = function(handler, data) {
        if (handler.word_be) {
            var h = (data.charCodeAt(0) << 24) | (data.charCodeAt(1) << 16) | (data.charCodeAt(2) << 8) | (data.charCodeAt(3) << 0);
            var l = (data.charCodeAt(4) << 24) | (data.charCodeAt(5) << 16) | (data.charCodeAt(6) << 8) | (data.charCodeAt(7) << 0);
        } else {
            var l = (data.charCodeAt(3) << 24) | (data.charCodeAt(2) << 16) | (data.charCodeAt(1) << 8) | (data.charCodeAt(0) << 0);
            var h = (data.charCodeAt(7) << 24) | (data.charCodeAt(6) << 16) | (data.charCodeAt(5) << 8) | (data.charCodeAt(4) << 0);
        }
        return (h << 32) | l;
    };

    self.read_uleb128 = function(handler, data) {
        var rv = 0;
        var off = 0;
        while (true) {
            var v = data.getc();
            rv |= (v & 0x7f) << off;
            if ((v & 0x80) == 0) {
                break;
            }
            off += 7;
        }
        return rv;
    };

    self.read_lsleb128 = function(handler, data) {
        var rv = 0;
        var mask = -1;
        var off = 0;
        while (true) {
            var v = data.getc();
            rv |= (v & 0x7f) << off;
            off += 7;
            if ((v & 0x80) == 0) {
                if ((v & 0x40) && off < 64) {
                    rv |= mask << off;
                }
                break;
            }
        }
        return rv;
    };

    self.read_sleb128 = function(handler, data) {
        var rv = 0;
        var off = 0;
        while (true) {
            var v = data.getc();
            rv |= (v & 0x7f) << off;
            off += 7;
            if ((v & 0x80) == 0) {
                if ((v & 0x40) && off < 32) {
                    rv |= -1 << off;
                }
                break;
            }
        }
        return rv;
    };

    self.read_f64 = function(handler, data) {
        alert("fuck floats");
    };

    self.read_byte = function(handler, data) {
        return data.getc();
    };

    self.read_typeid = function(handler, data) {
        return handler.types[self.read_uleb128(handler, data) - 1];
    };

    self.read_strid = function(handler, data) {
        return handler.str_table[self.read_uleb128(handler, data)];
    };

    self.get_nbr_elements = function(t) {
        switch (t.kind) {
            case rtik.type_b2:
            case rtik.type_e8:
            case rtik.type_e32:
            case rtik.type_i32:
            case rtik.type_i64:
            case rtik.type_f64:
            case rtik.type_p32:
            case rtik.type_p64:
            case rtik.subtype_scalar:
                return 1;
            case rtik.type_array:
                return -1;
            case rtik.subtype_array:
            case rtik.type_record:
            case rtik.subtype_record:
                return t.nbr_scalars;
            default:
                console.log("dafuq is this type?");
        }
    };

    self.get_base_type = function(t) {
        switch (t.kind) {
            case rtik.type_b2:
            case rtik.type_e8:
            case rtik.type_e32:
            case rtik.type_i32:
            case rtik.type_i64:
            case rtik.type_f64:
            case rtik.type_p32:
            case rtik.type_p64:
                return t;
            case rtik.subtype_scalar:
            case rtik.subtype_array:
                return t.base;
            default:
                console.log("dafuq is this type?");
        }
    };

    self.get_range_length = function(range) {
        var res;
        switch (range.kind) {
            case rtik.type_i32:
            case rtik.type_b2:
            case rtik.type_e8:
                if (range.dir) {
                    res = range.left - range.right + 1;
                } else {
                    res = range.right - range.left + 1;
                }
                break;
            default:
                console.log("cant handle this type!");
                break;
        }
        return (res <= 0) ? 0 : res;
    };

    self.read_array_subtype = function(handler, data, base) {
        var e = {};
        e.kind = rtik.subtype_array;
        e.name = "";
        e.base = base;
        var nbr_scalars = self.get_nbr_elements(base.el);
        e.rngs = [];
        for (var i = 0; i < base.dims.length; ++i) {
            e.rngs.push(self.read_range(handler, data));
            nbr_scalars *= self.get_range_length(e.rngs[i]);
        }
        e.nbr_scalars = nbr_scalars;
        return e;
    };

    self.read_record_subtype = function(handler, data, base) {
        var e = {};
        e.kind = rtik.subtype_record;
        e.name = "";
        e.base = base;
        if (base.nbr_scalars >= 0) {
            e.nbr_scalars = base.nbr_scalars;
            e.els = base.els;
        } else {
            e.els = [];
            var nbr_scalars = 0;
            for (var i = 0; i < base.els.length; ++i) {
                var btype = base.els[i].type;
                var el_nbr_scalars = get_nbr_elements(btype);
                var elem = {};
                elem.name = base.els[i].name;
                if (el_nbr_scalars >= 0) {
                    elem.type = btype;
                } else {
                    switch (btype.kind) {
                        case rtik.type_array:
                            elem.type = read_array_subtype(handler, data, btype);
                            break;
                        case rtik.type_record:
                            elem.type = read_record_subtype(handler, data, btype);
                            break;
                        default:
                            console.log("nonononono");
                            return -1;
                    }
                    el_nbr_scalars = get_nbr_elements(elem.type);
                }
                
                e.els.push(elem);
                nbr_scalars += el_nbr_scalars;
            }
            e.nbr_scalars = nbr_scalars;
        }
        return  e;
    };

    self.read_range = function(handler, data) {
        var t = data.getc();
        var r = {};
        r.kind = t & 0x7f;
        r.dir = (t & 0x80) != 0;
        switch (t & 0x7f) {
            case rtik.type_b2:
            case rtik.type_e8:
                r.left = self.read_byte(handler, data);
                r.right = self.read_byte(handler, data);
                break;
            case rtik.type_i32:
            case rtik.type_p32:
                r.left = self.read_sleb128(handler, data);
                r.right = self.read_sleb128(handler, data);
                break;
            case rtik.type_i64:
            case rtik.type_p64:
                r.left = self.read_lsleb128(handler, data);
                r.right = self.read_lsleb128(handler, data);
                break;
            case rtik.type_f64:
                r.left = self.read_f64(handler, data);
                r.right = self.read_f64(handler, data);
                break;
            default:
                console.log("nononono!");
                return -1;
        }
        return r;
    };

    self.read_value = function(handler, data, type) {
        switch (self.get_base_type(type).kind) {
            case rtik.type_b2:
            case rtik.type_e8:
                return data.getc();
            case rtik.type_i32:
            case rtik.type_p32:
                return self.read_sleb128(handler, data);
            case rtik.type_f64:
                return self.read_f64(handler, data);
            case rtik.type_p64:
                return self.read_lsleb128(handler, data);
            default:
                console.log("cant handle this type" + type);
                return;
        }
    };

    self.read_signal = function(handler, data, sigs, type, offset) {
        switch (type.kind) {
            case rtik.type_b2:
            case rtik.type_e8:
            case rtik.type_e32:
            case rtik.subtype_scalar:
                var sig_el = self.read_uleb128(handler, data);
                sigs[offset] = sig_el;
                if (!(sig_el in handler.sigs)) {
                    handler.sigs[sig_el] = {};
                    handler.sigs[sig_el].type = self.get_base_type(type);
                }
                break;
            case rtik.subtype_array:
                var len = type.nbr_scalars;
                var stride = self.get_nbr_elements(type.base.el);
                for (var i = 0; i < len; i += stride) {
                    self.read_signal(handler, data, sigs, type.base.el, i);
                }
                break;
            case rtik.type_record:
                var nbr_fields = type.els.length;
                var off = 0;
                for (var i = 0; i < nbr_fields; ++i) {
                    self.read_signal(handler, data, sigs, type.els[i].type, off);
                    off += self.get_nbr_elements(type.els[i].type);
                }
                break;
        }
    };

    self.read_str = function(data, rv) {
        var hdr = data.read(12);

        if (hdr.charCodeAt(0) != 0 || hdr.charCodeAt(1) != 0 || hdr.charCodeAt(2) != 0 || hdr.charCodeAt(3) != 0) {
            return -1;
        }
        var nbr_str = self.get_i32(rv, hdr.substring(4)) + 1;
        var str_size = self.get_i32(rv, hdr.substring(8));
        console.log("strings: " + nbr_str);
        console.log("table size: " + str_size);
        rv.str_table = [];
        rv.str_table.push("<anon>");
        var prev_len = 0; //wtf is up with this string encoding???
        var prev_string = "";
        for (var i = 1; i < nbr_str; ++i) {
            var current_str = prev_string.substring(0, prev_len);
            var c = "";

            while (true) {
                c = data.gets();
                var tmp = c.charCodeAt(0);
                if ((tmp >= 0 && tmp <= 31) || (tmp >= 128 && tmp <= 159)) {
                    break;
                }
                current_str += c;
            }
            prev_string = current_str;
            prev_len = c.charCodeAt(0) & 0x1f;
            var sh = 5;
            while (c.charCodeAt(0) >= 128) {
                c = data.gets();
                prev_len |= (c & 0x1f) << sh;
                sh += 5;
            }
            rv.str_table.push(current_str);
        }
        if (data.read(4) != "EOS\0") {
            return -1;
        }

    };

    self.read_type = function(data, rv) {
        var hdr = data.read(8);
        if (hdr.charCodeAt(0) != 0 || hdr.charCodeAt(1) != 0 || hdr.charCodeAt(2) != 0 || hdr.charCodeAt(3) != 0) {
            return -1;
        }
        var nbr_types = self.get_i32(rv, hdr.substring(4));
        rv.types = []
        for (var i = 0; i < nbr_types; ++i) {
            var t = data.getc();
            switch (t) {
                case rtik.type_b2:
                case rtik.type_e8:
                    var e = {};
                    e.kind = t;
                    e.name = self.read_strid(rv, data);
                    e.lits = [];
                    var nbr = self.read_uleb128(rv, data);
                    for (var j = 0; j < nbr; ++j) {
                        e.lits.push(self.read_strid(rv, data));
                    }
                    rv.types.push(e);
                    break;
                case rtik.type_i32:
                case rtik.type_i64:
                case rtik.type_f64:
                    var e = {};
                    e.kind = t;
                    e.name = self.read_strid(rv, data);
                    rv.types.push(e);
                    break;
                case rtik.type_p32:
                case rtik.type_p64:
                    var e = {};
                    e.kind = t;
                    e.name = self.read_strid(rv, data);
                    e.units = [];
                    if (h.version != 0) {
                        var nbr_units = self.read_uleb128(rv, data);
                        for (var j = 0; j < nbr_units; ++j) {
                            var unit = {};
                            unit.name = self.read_strid(rv, data);
                            unit.val = self.read_lsleb128(rv, data);
                            e.units.push(unit);
                        }
                    }
                    rv.types.push(e);
                    break;
                case rtik.subtype_scalar:
                    var e = {};
                    e.kind = t;
                    e.name = self.read_strid(rv, data);
                    e.base = self.read_typeid(rv, data);
                    e.rng = self.read_range(rv, data);
                    rv.types.push(e);
                    break;
                case rtik.type_array:
                    var e = {};
                    e.kind = t;
                    e.name = self.read_strid(rv, data);
                    e.el = self.read_typeid(rv, data);
                    var nbr_dims = self.read_uleb128(rv, data);
                    e.dims = []
                    for (var j = 0; j < nbr_dims; ++j) {
                        e.dims.push(self.read_typeid(rv, data));
                    }
                    rv.types.push(e);
                    break;
                case rtik.subtype_array:
                    var name = self.read_strid(rv, data);
                    var base = self.read_typeid(rv, data);
                    var e = self.read_array_subtype(rv, data, base);
                    e.name = name;
                    rv.types.push(e);
                    break;
                case rtik.type_record:
                    var e = {};
                    e.kind = t;
                    e.name = self.read_strid(rv, data);
                    e.els = [];
                    var nbr_field = self.read_uleb128(rv, data);
                    var nbr_scalars = 0;
                    for (var j = 0; j < nbr_field; ++j) {
                        var elem = {};
                        elem.name = self.read_strid(rv, data);
                        elem.type = self.read_typeid(rv, data);
                        if (nbr_scalars != -1) {
                            var f_nbr_scalars = self.get_nbr_elements(elem.type);
                            if (f_nbr_scalars == -1) {
                                nbr_scalars = -1;
                            } else {
                                nbr_scalars += f_nbr_scalars;
                            }
                        }
                        e.els.push(elem);
                    }
                    e.nbr_scalars = nbr_scalars;
                    rv.types.push(e);
                    break;
                case rtik.subtype_record:
                    var name = self.read_strid(rv, base);
                    var base = self.read_typeid(rv, base);
                    var e = self.read_record_subtype(rv, data, base);
                    e.name = name;
                    rv.types.push(e);
                default:
                    console.log("cant handle this: " + t);
                    break;
            }
        }
        if (data.getc() != 0) {
            return -1;
        }
    };

    self.read_wk_type = function(data, rv) {
        var hdr = data.read(4);
        if (hdr.charCodeAt(0) != 0 || hdr.charCodeAt(1) != 0 || hdr.charCodeAt(2) != 0 || hdr.charCodeAt(3) != 0) {
            return -1;
        }
        while (true) {
            var t = data.getc();
            if (t == 0) {
                break;
            }
            var tid = self.read_typeid(rv, data);
            if (tid.kind == rtik.type_b2 || tid.kind == rtik.type_e8) {
                tid.wkt = t;
            }
        }
    };

    self.read_hie = function(data, rv) {
        var hdr = data.read(16);
        if (hdr.charCodeAt(0) != 0 || hdr.charCodeAt(1) != 0 || hdr.charCodeAt(2) != 0 || hdr.charCodeAt(3) != 0) {
            return -1;
        }
        var nbr_scopes = self.get_i32(rv, hdr.substring(4));
        var nbr_sigs = self.get_i32(rv, hdr.substring(8));
        var nbr_basic_sigs = self.get_i32(rv, hdr.substring(12));
        console.log("reading " + nbr_scopes + " scopes, " + nbr_sigs + " signals, " + nbr_basic_sigs + " signal elements");

        rv.hie = {};
        rv.sigs = [];
        rv.nbr_sigs = nbr_basic_sigs + 1;
        rv.hie.name = "";
        var stack = [rv.hie];
        var parent = rv.hie;
        while (true) {
            var t = data.getc();
            var el = {};
            
            if (t == hie_kind.eoh) {
                break;
            }
            if (t == hie_kind.eos) {
                parent = stack.pop();
                //todo handle going up in the hierarchy
                continue;
            }
            el.kind = t;
            el.name = self.read_strid(rv, data);

            switch (t) {
                case hie_kind.eoh:
                case hie_kind.design:
                case hie_kind.eos:
                    console.log("invalid hie kind!");
                    return -1;
                case hie_kind.process:
                    if (!("children" in parent)) {
                        parent.children = [];
                    }
                    parent.children.push(el);
                    break;
                case hie_kind.generate_for:
                    el.type = self.read_typeid(rv, data);
                    el.value = self.read_value(rv, data, el.type);
                case hie_kind.block:
                case hie_kind.generate_if:
                case hie_kind.instance:
                case hie_kind.generic:
                case hie_kind.package:
                    if (!("children" in parent)) {
                        parent.children = [];
                    }
                    parent.children.push(el);
                    stack.push(parent);
                    parent = parent.children[parent.children.length-1];
                    break;
                case hie_kind.signal:
                case hie_kind.port_in:
                case hie_kind.port_out:
                case hie_kind.port_inout:
                case hie_kind.buffer:
                case hie_kind.linkage:
                
                    el.type = self.read_typeid(rv, data);
                    var nbr_el = self.get_nbr_elements(el.type);
                    el.sigs = []
                    self.read_signal(rv, data, el.sigs, el.type, 0);
                    if (!("children" in parent)) {
                        parent.children = [];
                    }
                    parent.children.push(el);
                    break;
                default:
                    console.log("cant handle this kind");
                    return -1;
            }
        }
    };

    self.read_eoh = function(data, rv) {
        return -1;
    };

    self.read_base_table = {
        "STR\0": self.read_str,
        "TYP\0": self.read_type,
        "WKT\0": self.read_wk_type,
        "HIE\0": self.read_hie,
        "EOH\0": self.read_eoh
    };

    self.read_base = function(data, rv) {
        var hdr = data.read(4);
        if (hdr in self.read_base_table) {
            var func = self.read_base_table[hdr];
            return func(data, rv);
        } else {
            console.log("cant handle this section:" + hdr);
            return -1;
        }
    };

    self.read_snapshot = function(data, rv, values) {
        hdr = data.read(12);
        if (hdr.charCodeAt(0) != 0 || hdr.charCodeAt(1) != 0 || hdr.charCodeAt(2) != 0 || hdr.charCodeAt(3) != 0) {
            return -1;
        }
        var el = {};
        el.snap_time = self.get_i64(rv, hdr.substring(4));
        el.sigs = [];
        for (var i = 0; i < rv.nbr_sigs; ++i) {
            if (i in rv.sigs) {
                if (rv.sigs[i].type == 0) {
                    console.log("0 type");
                }
                if (rv.sigs[i].type.kind != 23) {
                    console.log("uhh a non int signal");
                }
                el.sigs[i] = self.read_value(rv, data, rv.sigs[i].type);
            }
        }
        values.push(el);
        if (data.read(4) != "ESN\0") {
            return -1;
        }
        
    };

    self.read_cycle_start = function(data, rv) {
        var hdr = data.read(8);
        return self.get_i64(rv, hdr);
    };

    self.read_cycle_cont = function(data, rv, el) {
        var i = 0;
        el.sigs = [];
        while (true) {
            var d = self.read_uleb128(rv, data);
            if (d == 0) {
                break;
            }
            while (d > 0) {
                ++i;
                if (i in rv.sigs) {
                    --d;
                }
            }
            el.sigs[i] = self.read_value(rv, data, rv.sigs[i].type);
        }
    };

    self.read_cycle_next = function(data, rv) {
        return self.read_lsleb128(rv, data);
    }

    self.read_cycle_end = function(data, rv) {
        if (data.read(4) != "ECY\0") {
            return -1;
        }
        return 0;
    }

    self.read_cycle = function(data, rv, values) {
        var el = {};
        el.snap_time = self.read_cycle_start(data, rv);
        var time = el.snap_time;
        while (true) {
            self.read_cycle_cont(data, rv, el);
            //console.log("time: " + el.snap_time);

            var tmp = self.read_cycle_next(data, rv);
            values.push(el);
            el = {};
            if (tmp == -1) {
                break;
            } else {
                time += tmp;
                el.snap_time = time;
            }
        }
        self.read_cycle_end(data, rv);
    };

    self.read_dump_table = {
        "SNP\0": self.read_snapshot,
        "CYC\0": self.read_cycle
    };

    self.read_dump = function(data, rv, values) {
        var hdr = data.read(4);
        if (hdr in self.read_dump_table) {
            var func = self.read_dump_table[hdr];
            return func(data, rv, values);
        } else {
            console.log("cant handle this section:" + hdr);
            return -1;
        }
    };

    self.read_headers = function(data, rv) {
        var tmp = 1;
        while (tmp != -1) {
            tmp = this.read_base(data, rv);
            console.log(tmp);
        }
    };

    self.File = class {
        constructor(name) {
            this.name = name;
            this.buffer = "";
            this.buffer_os = 0;
            this.block_size = 4096*4;
            this.offset = 0;
        }

        getc() {
            return (this.gets()).charCodeAt(0);
        }

        gets() {
            if (this.buffer_os == this.buffer.length) {
                this.buffer = this.read_some(this.name, this.offset, this.block_size);
                this.buffer_os = 0;
                this.offset += this.block_size;
            }
            
            var tmp = this.buffer.substring(this.buffer_os, this.buffer_os + 1);
            this.buffer_os++;
            return tmp;
        }
        read(len) {
            var rv = "";
            for (var i = 0; i < len; ++i) {
                rv += this.gets();
            }
            return rv;
        }

        read_some(file, offset, size) {
            var reader = new FileReaderSync();
            var blob = file.slice(offset, offset + size);
            return reader.readAsBinaryString(blob);
        }
    };

    self.print_hie = function(hie, prefix) {
        rv = "<li><span>" + prefix + hie.name
        if ("type" in hie) {
            if (hie.type.kind == 35) {
                rv += " : " + hie.type.base.name;
            } else {
                rv += " : " + hie.type.name;
            }
        }
        if ("sigs" in hie) {
            if (hie.sigs.length > 1) {
                rv += ": #" + hie.sigs[0] + "-#" + hie.sigs[hie.sigs.length-1];
            } else {
                rv += ": #" + hie.sigs[0];
            }
        }
        rv += "</span>" + "<ul>";
        if ("children" in hie) {
            for (child of hie.children) {
                rv += self.print_hie(child, prefix + " ");
            }
        }
        return rv + "</li></ul>";
    };

    self.convert_values = function(vals, handler) {
        var rv = [];
        for (var i = 0; i < handler.nbr_sigs; ++i) {
            var el = {};
            el.steps = [];
            for (var val of vals) {
                if (i in val.sigs) {
                    var v = {};
                    v.snap_time = val.snap_time;
                    v.value = val.sigs[i];
                    el.steps.push(v);
                }
            }

            rv.push(el);
        }
        return rv;
    }

    return self;
})();

onmessage = function(ev) {
    var file_el = ev.data;
    var f = new ghw.File(file_el);
    var handler = {};
    ghw.open_ghw(f, handler);
    ghw.read_headers(f, handler);
    var msg = {};
    msg.type = "HIE";
    msg.val = ghw.print_hie(handler.hie, "");
    postMessage(msg);
    
    var values = [];
    ghw.read_dump(f, handler, values);
    ghw.read_dump(f, handler, values);
    var sigs = ghw.convert_values(values, handler);
    msg.type = "VAL";
    msg.val = sigs;
    postMessage(msg);
    
}