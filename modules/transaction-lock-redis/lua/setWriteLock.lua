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

if isReadLocked == 1 then
  return { err = 'There exists a read lock on this resource' }
end

local writeLockId = redis.call('get', writeLock)

if writeLockId then
  if writeLockId == transactionId then
    return 0
  end
  return { err = 'There already exists a write lock on this resource' }
end

redis.call('hmset', transactionId, 'type', 'write', 'key', writeLock)

local result = redis.call('set', writeLock, transactionId, 'NX')

if ttl ~= 'null' then
  redis.call('pexpire', transactionId, ttl * 2)
  redis.call('pexpire', writeLock, ttl)
end

return result
