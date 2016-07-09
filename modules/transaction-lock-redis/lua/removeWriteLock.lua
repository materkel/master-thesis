--
-- unlock an exclusive resource lock
--
-- KEYS[1] - resource key
-- ARGV[1] - transaction id
local resource = KEYS[1]
local transactionId = ARGV[1]
local writeLock = resource .. ':lock:write'

local lock = redis.call('get', writeLock)

if lock == transactionId then
  return redis.call('del', writeLock)
end

if not lock then
  return 0
end

return { err = "resource is not owned by this process (transactionId does not match)" }
