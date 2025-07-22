const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ResearchPosts table
    await queryInterface.createTable('ResearchPosts', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      media: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
      },
      mediaType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      visibility: {
        type: DataTypes.STRING,
        defaultValue: 'public',
      },
      tags: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      researchType: {
        type: DataTypes.ENUM('experiment', 'survey', 'review', 'case_study', 'theoretical', 'methodology', 'results', 'discussion'),
        allowNull: false,
        defaultValue: 'results'
      },
      methodology: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      results: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conclusions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      citations: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      doi: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preprintUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      openAccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      funding: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conflictsOfInterest: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      factCheckStatus: {
        type: DataTypes.ENUM('pending', 'verified', 'flagged', 'disputed'),
        defaultValue: 'pending'
      },
      factCheckScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      factCheckNotes: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      likes: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      shares: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      collaborationStatus: {
        type: DataTypes.ENUM('open', 'invite_only', 'closed'),
        defaultValue: 'open'
      },
      collaborators: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create FactChecks table
    await queryInterface.createTable('FactChecks', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      researchPostId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ResearchPosts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: DataTypes.ENUM('correction', 'clarification', 'citation', 'methodology_concern', 'result_question', 'general_note'),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'resolved'),
        defaultValue: 'pending'
      },
      severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium'
      },
      evidence: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      citations: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      votes: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      voteScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isResolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      resolvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      resolutionNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Collaborations table
    await queryInterface.createTable('Collaborations', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      researchPostId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ResearchPosts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: DataTypes.ENUM('lead', 'co_author', 'contributor', 'reviewer', 'advisor'),
        allowNull: false,
        defaultValue: 'contributor'
      },
      status: {
        type: DataTypes.ENUM('invited', 'accepted', 'declined', 'pending'),
        defaultValue: 'invited'
      },
      contribution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expertise: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      permissions: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
      },
      invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      invitedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('ResearchPosts', ['createdAt']);
    await queryInterface.addIndex('ResearchPosts', ['userId']);
    await queryInterface.addIndex('ResearchPosts', ['researchType']);
    await queryInterface.addIndex('ResearchPosts', ['factCheckStatus']);
    await queryInterface.addIndex('ResearchPosts', ['openAccess']);

    await queryInterface.addIndex('FactChecks', ['researchPostId']);
    await queryInterface.addIndex('FactChecks', ['userId']);
    await queryInterface.addIndex('FactChecks', ['status']);
    await queryInterface.addIndex('FactChecks', ['type']);
    await queryInterface.addIndex('FactChecks', ['voteScore']);

    await queryInterface.addIndex('Collaborations', ['researchPostId']);
    await queryInterface.addIndex('Collaborations', ['userId']);
    await queryInterface.addIndex('Collaborations', ['status']);
    await queryInterface.addIndex('Collaborations', ['role']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Collaborations');
    await queryInterface.dropTable('FactChecks');
    await queryInterface.dropTable('ResearchPosts');
  }
}; 