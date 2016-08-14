--
-- set a read lock on a resource group
--
-- KEYS[1] - resource key
-- ARGV[1] - transaction id
-- ARGV[2] - ttl
local resource = KEYS[1]
local transactionId = ARGV[1]
local ttl = ARGV[2]
local readLock = resource .. ':lock:read'
local writeLock = resource .. ':lock:write'

local isWriteLocked = redis.call('exists', writeLock)

if isWriteLocked == 1 then
  return { err = 'There exists a write lock on this resource' }
end

redis.call('hmset', transactionId, 'type', 'read', 'key', readLock)

local result = redis.call('hset', readLock, transactionId, 'lock')

if ttl ~= 'null' then
  redis.call('pexpire', transactionId, ttl * 2)
  redis.call('pexpire', readLock, ttl)
end

return result
