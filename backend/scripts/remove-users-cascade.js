const { Op } = require('sequelize');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Reaction = require('./models/Reaction');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const Notification = require('./models/Notification');
const UserRelationship = require('./models/UserRelationship');
const GroupChat = require('./models/GroupChat');
const GroupChatMember = require('./models/GroupChatMember');
const GroupMessage = require('./models/GroupMessage');
const sequelize = require('./db');

async function removeUsersCascade() {
  try {
    await sequelize.sync();
    
    console.log('🔍 Checking current users...\n');
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'position', 'institution']
    });
    
    console.log('Current users:');
    users.forEach(u => {
      console.log(`${u.id}: ${u.firstName} ${u.lastName} - ${u.position || 'No position'} at ${u.institution || 'No institution'}`);
    });
    
    // Users to remove based on the description
    const usersToRemove = [
      { firstName: 'Test', lastName: 'User' },
      { firstName: 'Elijah', lastName: 'Dalton' },
      { firstName: 'Elijah', lastName: 'Morris' }
    ];
    
    console.log('\n🗑️  Removing specified users and their data...\n');
    
    let removedCount = 0;
    
    for (const userToRemove of usersToRemove) {
      const user = await User.findOne({
        where: {
          firstName: userToRemove.firstName,
          lastName: userToRemove.lastName
        }
      });
      
      if (user) {
        console.log(`\nRemoving user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
        
        const userId = user.id;
        
        // Remove related data in the correct order
        try {
          // 1. Remove group messages
          const groupMessagesDeleted = await GroupMessage.destroy({
            where: { senderId: userId }
          });
          console.log(`  - Removed ${groupMessagesDeleted} group messages`);
          
          // 2. Remove group chat memberships
          const groupMembershipsDeleted = await GroupChatMember.destroy({
            where: { userId: userId }
          });
          console.log(`  - Removed ${groupMembershipsDeleted} group memberships`);
          
          // 3. Remove group chats created by this user
          const groupChatsDeleted = await GroupChat.destroy({
            where: { createdBy: userId }
          });
          console.log(`  - Removed ${groupChatsDeleted} group chats`);
          
          // 4. Remove messages
          const messagesDeleted = await Message.destroy({
            where: { 
              [Op.or]: [
                { senderId: userId },
                { receiverId: userId }
              ]
            }
          });
          console.log(`  - Removed ${messagesDeleted} messages`);
          
          // 5. Remove conversations
          const conversationsDeleted = await Conversation.destroy({
            where: {
              [Op.or]: [
                { participant1Id: userId },
                { participant2Id: userId }
              ]
            }
          });
          console.log(`  - Removed ${conversationsDeleted} conversations`);
          
          // 6. Remove reactions
          const reactionsDeleted = await Reaction.destroy({
            where: { userId: userId }
          });
          console.log(`  - Removed ${reactionsDeleted} reactions`);
          
          // 7. Remove comments
          const commentsDeleted = await Comment.destroy({
            where: { userId: userId }
          });
          console.log(`  - Removed ${commentsDeleted} comments`);
          
          // 8. Remove posts
          const postsDeleted = await Post.destroy({
            where: { userId: userId }
          });
          console.log(`  - Removed ${postsDeleted} posts`);
          
          // 9. Remove notifications
          const notificationsDeleted = await Notification.destroy({
            where: {
              [Op.or]: [
                { recipientId: userId },
                { senderId: userId }
              ]
            }
          });
          console.log(`  - Removed ${notificationsDeleted} notifications`);
          
          // 10. Remove user relationships (follows)
          const relationshipsDeleted = await UserRelationship.destroy({
            where: {
              [Op.or]: [
                { followerId: userId },
                { followingId: userId }
              ]
            }
          });
          console.log(`  - Removed ${relationshipsDeleted} user relationships`);
          
          // 11. Finally remove the user
          await user.destroy();
          console.log(`  - Removed user account`);
          
          removedCount++;
          console.log(`  ✅ Successfully removed ${user.firstName} ${user.lastName}`);
          
        } catch (error) {
          console.error(`  ❌ Error removing ${user.firstName} ${user.lastName}:`, error.message);
        }
        
      } else {
        console.log(`User not found: ${userToRemove.firstName} ${userToRemove.lastName}`);
      }
    }
    
    console.log(`\n✅ Removed ${removedCount} users successfully!`);
    
    // Show remaining users
    console.log('\n📋 Remaining users:');
    const remainingUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'position', 'institution']
    });
    
    remainingUsers.forEach(u => {
      console.log(`${u.id}: ${u.firstName} ${u.lastName} - ${u.position || 'No position'} at ${u.institution || 'No institution'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

removeUsersCascade(); 