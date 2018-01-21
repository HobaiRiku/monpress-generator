/*
 * @Author: HobaiRiku 
 * @Date: 2018-01-09 09:06:01 
 * @Last Modified by:   HobaiRiku 
 * @Last Modified time: 2018-01-09 09:06:01 
 */
exports.RESTful = function(model ,populate, where, sort,populate_get,message,status ){
const action =require('./action');
let  router = require('express').Router({mergeParams: true});
if(model) router.use('/',action.setModel(model));
if(populate) router.use('/',action.setPopulate(populate));
if(populate_get) router.use('/',action.setPopulate_get(populate_get));
if(where) router.use('/',action.setWhere(where));
if(sort) router.use('/',action.setSort(sort));
let add_message 
let del_message 
let update_message 
let add_status
let del_status 
let update_status 
if(message){
    add_message = message.add;
    del_message = message.del;
     update_message = message.update;
}
if(status){
    add_status = status.add;
    del_status = status.del;
    update_status = status.update;
}
//list查询
router.get('/',action.list());
//添加
router.post('/',action.add(null,add_message,add_status));
//删除
router.delete('/:_id', action.del(null,del_message,del_status));
//修改
router.put('/:_id', action.update(null,update_message,update_status));
//查询
router.get('/:_id',action.get() );

return router;
}