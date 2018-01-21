/*
 * @Author: HobaiRiku 
 * @Date: 2018-01-09 09:05:52 
 * @Last Modified by: HobaiRiku
 * @Last Modified time: 2018-01-21 01:47:55
 */
const hobai_tool = require('hobai-nodejs-tool');
const getQuery = hobai_tool.application.getQuery.get;
const getPage = hobai_tool.application.getPage;
const getBodyForEntity = hobai_tool.application.getBodyForEntity;
const EventEmitter = require('events');
class Emitter extends EventEmitter {};
const _thisEmiiter = new Emitter();
exports.eventEmitter = _thisEmiiter;
exports.list = function list(model, populate, where, sort) {
    return async function cb(req, res, next) {
        let _model = model ? model : req.model;
        let _populate = populate ? populate : req.populate;
        let _where = where ? where : req.where;
        let _sort = sort ? sort : req.sort;
        let _condition = req.condition;
        let _page = req.page;
        _thisEmiiter.emit('request', req);
        if (!req.isInit) reqinit();
        try {
            let query = _model.find(_condition);
            //populate
            if (_populate) {
                if (typeof (_populate) == "string") {
                    query = query.populate(_populate);
                } else {
                    for (let one of _populate) {
                        query = query.populate(one);
                    }
                }
            }
            //where
            if (_where ) {
                if(_where.length){
                for (let one of _where) {
                    if(one.name && one.in)
                    query = query.where(one.name).in(one.in);
                }
            }else{
                query = query.where(_where.name).in(_where.in);
            }
            }
            //分页
            query = query.skip(_page.skip).limit(_page.size);
            //sort排序
            query = query.sort(_sort ? _sort : "-createAt")
            //查询
            let list = await query.exec();
            //查询总数
            let count = await _model.find(_condition).count().exec();
            //包装结果
            let result = {
                "list": list,
                "count": count
            }
            _thisEmiiter.emit('list', req, null);
            res.status(200).json(result).end();
        } catch (error) {
            next(error);
        }
    }
}

exports.add = function add(model, message, status) {
    return async function cb(req, res, next) {
        _thisEmiiter.emit('request', req);
        let _model = model ? model : req.model;
        if (!req.isInit) reqinit();
        try {
            let obj_new = new _model(req.entity);
            await obj_new.save();
            _thisEmiiter.emit('add', req, obj_new);
            res.status(status ? status : 201);
            let message_send = {
                _id: obj_new._id,
                message: "added"
            };
            if (message instanceof Array) {
                throw new Error('message can not be an Array');
            }
            if (typeof (message) == "string") {
                message_send = {
                    _id: obj_new._id,
                    message: message
                }
            }
            if (typeof (message) == "object") {
                message_send = message;
                message._id = obj_new._id;
            }
            res.send(message_send);
        } catch (error) {
            next(error)
        }
    }
}
exports.del = function del(model, message, status) {
    return async function cb(req, res, next) {
        _thisEmiiter.emit('request', req);
        let _model = model ? model : req.model;
        if (!req.isInit) reqinit();
        try {
            let _id = req.params._id;
            let obj_del = await _model.findByIdAndRemove(_id);
            if(!obj_del) throw new Error("_id not found");
            _thisEmiiter.emit('del', req, obj_del);
            res.status(status ? status : 200);
            res.send(message ? message : {
                message: "deleted"
            });
        } catch (error) {
            next(error)
        }
    }
}
exports.update = function update(model, message, status) {
    return async function cb(req, res, next) {
        _thisEmiiter.emit('request', req);
        let _model = model ? model : req.model;
        if (!req.isInit) reqinit();
        try {
            let _id = req.params._id;
            let obj_update = await _model.findByIdAndUpdate(_id, req.entity, {
                new: true
            });
            if(!obj_update) throw new Error('_id not found');
            _thisEmiiter.emit('update', req, obj_update);
            res.status(status ? status : 200);
            res.send(message ? message : {
                message: "updated"
            });
        } catch (error) {
            next(error)
        }
    }
}
exports.get = function get(model, populate) {
    return async function cb(req, res, next) {
        _thisEmiiter.emit('request', req);
        let _model = model ? model : req.model;
        if (!req.isInit) reqinit();
        let _populate = populate ? populate : (req.populate_get ? req.populate_get : req.populate);
        try {
            let _id = req.params._id;
            let query = _model.findById(_id);
            //populate
            if (_populate) {
                if (typeof (_populate) == "string") {
                    query = query.populate(_populate);
                } else {
                    for (let one of _populate) {
                        query = query.populate(one);
                    }
                }
            }
            //查询
            let obj_get = await query.exec();
            _thisEmiiter.emit('get', req, obj_get);
            res.json(obj_get);
        } catch (error) {
            next(error)
        }
    }
}
exports.reqinit = function reqinit() {
    return function cb(req, res, next) {
        let page = getPage(req);
        let condition = getQuery(req);
        let entity = getBodyForEntity(req.body);
        req.page = page;
        req.condition = condition;
        req.entity = entity;
        req.isInit = true;
        next();
    }
}
exports.setModel = function setModel(model) {
    return function cb(req, res, next) {
        req.model = model;
        next()
    }
}
exports.setPopulate = function setPopulate(populate) {
    return function cb(req, res, next) {
        req.populate = populate;
        next()
    }
}
exports.setPopulate_get = function setPopulate_get(populate) {
    return function cb(req, res, next) {
        req.populate_get = populate;
        next()
    }
}
exports.setSort = function setSort(sort) {
    return function cb(req, res, next) {
        req.sort = sort;
        next()
    }
}
exports.setWhere = function setWhere(where) {
    return function cb(req, res, next) {
        req.where = where;
        next();
    }
}