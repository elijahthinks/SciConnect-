const onlineStatusService = require('./utils/onlineStatus');

async function testOnlineStatus() {
  console.log('🧪 Testing Online Status Service...\n');

  try {
    // Test 1: Set user online
    console.log('1. Setting user 1 online...');
    const result1 = await onlineStatusService.setUserOnline(1);
    console.log('✅ Result:', result1);

    // Test 2: Check if user is online
    console.log('\n2. Checking if user 1 is online...');
    const isOnline = await onlineStatusService.isUserOnline(1);
    console.log('✅ User 1 online status:', isOnline);

    // Test 3: Get multiple users status
    console.log('\n3. Getting status for multiple users...');
    const statuses = await onlineStatusService.getUsersOnlineStatus([1, 2, 3]);
    console.log('✅ Multiple user statuses:', statuses);

    // Test 4: Update last seen
    console.log('\n4. Updating last seen for user 1...');
    const updateResult = await onlineStatusService.updateLastSeen(1);
    console.log('✅ Update result:', updateResult);

    // Test 5: Get all online users
    console.log('\n5. Getting all online users...');
    const onlineUsers = await onlineStatusService.getOnlineUsers();
    console.log('✅ Online users:', onlineUsers);

    // Test 6: Set user offline
    console.log('\n6. Setting user 1 offline...');
    const result2 = await onlineStatusService.setUserOffline(1);
    console.log('✅ Result:', result2);

    // Test 7: Check if user is offline
    console.log('\n7. Checking if user 1 is offline...');
    const isOffline = await onlineStatusService.isUserOnline(1);
    console.log('✅ User 1 online status:', isOffline);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testOnlineStatus(); 