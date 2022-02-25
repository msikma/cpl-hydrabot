// hydrabot <https://github.com/msikma/hydrabot>
// © MIT license

const {sql} = require('../../sql')

function getMessageGroupByID(id) {
  return this.getMessageGroup(id)
}

function getMessageGroupByName(name, namespace = 'global') {
  return this.getMessageGroup(null, name, namespace)
}

function getMessageGroup(id, name, namespace = 'global') {
  const stmt = sql`
    select msg_component.remote_id, msg.id, msg.name from msg
    left join msg_component on msg_component.msg_id = msg.id
    ${id ? `where msg.id = ?;`
         : `where msg.name = ? and msg.namespace = ?;`}
  `
  const res = stmt.all(...(id ? [id] : [name, namespace]))
  if (!res.length) {
    return null
  }
  return {
    id: res[0].id,
    name: res[0].name,
    namespace: res[0].namespace,
    remoteIDs: res.map(row => row.remote_id)
  }
}

function setMessageGroupByID(id, remoteIDs = []) {
  return this.setMessageGroup(id, null, null, remoteIDs)
}

function setMessageGroupByName(name, namespace = 'global', remoteIDs = []) {
  return this.setMessageGroup(null, name, namespace, remoteIDs)
}

function setMessageGroup(id, name, namespace = 'global', remoteIDs = []) {
  const insertQuery = sql`insert into msg_component (msg_id, remote_id) values (@id, @remote_id);`
  const deleteQuery = sql`delete from msg_component where msg_id = @id;`
  
  let msgGroup = this.getMessageGroup(id, name, namespace)
  let msgID = msgGroup?.id
  if (!msgGroup) {
    const insertGroupQuery = sql`insert into msg (name, namespace) values (@name, @namespace);`
    insertGroupQuery.run({name, namespace})
    msgGroup = this.getMessageGroup(id, name, namespace)
    msgID = msgGroup?.id
  }

  // Delete all remote IDs tied to this message group.
  deleteQuery.run({id: msgID})

  // Now insert the new remote IDs.
  const insertManyQuery = this.db.transaction(idGroups => idGroups.forEach(idGroup => insertQuery.run(idGroup)))
  if (remoteIDs.length) {
    insertManyQuery(remoteIDs.map(remoteID => ({id: msgID, remote_id: remoteID})))
  }

  return this.getMessageGroupByID(msgID)
}

module.exports = {
  getMessageGroup,
  getMessageGroupByID,
  getMessageGroupByName,
  setMessageGroup,
  setMessageGroupByID,
  setMessageGroupByName
}
