--
-- set a write lock on a resource group
--
-- KEYS[1] - resource key
-- ARGV[1] - transaction id
-- ARGV[2] - ttl
local resource = KEYS[1]
local transactionId = ARGV[1]
local ttl = ARGV[2]
local readLock = resource .. ':lock:read'
local writeLock = resource .. ':lock:write'

local isReadLocked = redis.call('exists', readLock)
local isWriteLocked = redis.call('exists', writeLock)

if isReadLocked == 1 then
  return { err = 'There exists a read lock on this resource' }
end

if isWriteLocked == 1 then
  return { err = 'There already exists a write lock on this resource' }
end

if ttl ~= 'null' then
  return redis.call('set', writeLock, transactionId, 'PX', ttl, 'NX')
end

return redis.call('set', writeLock, transactionId, 'NX')
