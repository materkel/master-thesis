--
-- Set key to a new state
-- only if state of the key is still pending
--
-- KEYS[1]   - key
-- ARGV[1]   - new state
local key     = KEYS[1]
local newState = ARGV[1]

local state = redis.call('get', key)

if state == 'pending' then
  return redis.call('set', key, newState)
end

return { err = "state was already updated" }
