--
-- unlock an exclusive resource lock
--
-- KEYS[1] - resource key
-- ARGV[1] - transaction id
local lock = KEYS[1]
local transactionId = ARGV[1]

local lockId = redis.call('get', lock)

if lockId == transactionId then
  return redis.call('del', lock)
end

if not lockId then
  return 0
end

return { err = "resource is not owned by this process (transactionId does not match)" }
