const mongoose = require('mongoose');
const ForumBoard = require('../models/ForumBoard');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const User = require('../models/User');
require('dotenv').config();

const seedForumData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing forum data
    console.log('Clearing existing forum data...');
    await ForumBoard.deleteMany({});
    await ForumPost.deleteMany({});
    await ForumComment.deleteMany({});

    // Get test users
    const users = await User.find({ username: { $regex: /^testuser/i } }).limit(10);
    if (users.length === 0) {
      console.log('❌ No test users found. Run seedTestData.js first!');
      process.exit(1);
    }
    console.log(`✅ Found ${users.length} test users`);

    // Create Forum Boards
    console.log('Creating forum boards...');
    const boards = await ForumBoard.create([
      {
        name: 'Announcements',
        slug: 'announcements',
        description: 'News and announcements from the developers about the game.',
        icon: '💬',
        color: '#eeeeee',
        displayOrder: 1,
        isActive: true,
        stats: {
          totalPosts: 0,
          totalComments: 0
        }
      },
      {
        name: 'General Discussion',
        slug: 'general-discussion',
        description: 'General game talk, introductions, and off-topic discussions',
        icon: '💬',
        color: '#3B82F6',
        displayOrder: 2,
        isActive: true,
        stats: {
          totalPosts: 0,
          totalComments: 0
        }
      },
      {
        name: 'Character Strategies',
        slug: 'character-strategies',
        description: 'Share builds, tips, and strategies for your favorite characters',
        icon: '⚔️',
        color: '#F59E0B',
        displayOrder: 3,
        isActive: true,
        stats: {
          totalPosts: 0,
          totalComments: 0
        }
      },
      {
        name: 'Competitive Play',
        slug: 'competitive-play',
        description: 'Discuss ranked matches, tournaments, and competitive strategies',
        icon: '🏆',
        color: '#10B981',
        displayOrder: 4,
        isActive: true,
        stats: {
          totalPosts: 0,
          totalComments: 0
        }
      },
      {
        name: 'Bug Reports',
        slug: 'bug-reports',
        description: 'Report bugs, glitches, and technical issues',
        icon: '🐛',
        color: '#EF4444',
        displayOrder: 5,
        isActive: true,
        stats: {
          totalPosts: 0,
          totalComments: 0
        }
      },
      {
        name: 'Feedback & Suggestions',
        slug: 'feedback-suggestions',
        description: 'Share your ideas for improving the game',
        icon: '💡',
        color: '#8B5CF6',
        displayOrder: 6,
        isActive: true,
        stats: {
          totalPosts: 0,
          totalComments: 0
        }
      }
    ]);
    console.log(`✅ Created ${boards.length} forum boards`);

    // Sample post titles and content by board
    const postTemplates = {
      'general-discussion': [
        {
          title: 'Welcome to the Community!',
          content: 'Hey everyone! Just wanted to say hi and introduce myself. I\'ve been playing for about a week now and loving the game so far. Looking forward to learning from you all!\n\nWhat tips would you give to a new player?'
        },
        {
          title: 'Favorite Arena?',
          content: 'What\'s everyone\'s favorite arena to battle in? I personally love the Coral Reef - the underwater atmosphere is amazing!\n\nAlso, does anyone else think the Volcanic Rift needs better visibility? 😅'
        },
        {
          title: 'Game feels balanced lately',
          content: 'I\'ve been playing since the last patch and I gotta say, the game feels really well balanced right now. Every character seems viable and matches are super competitive.\n\nAnyone else notice this?'
        }
      ],
      'character-strategies': [
        {
          title: 'Lion Build Guide - Aggressive Playstyle',
          content: 'After maining Lion for 50+ matches, here\'s my recommended build:\n\n**Greater Talent:** Predator\'s Instinct\n**Lesser Talents:**\n- Enhanced Roar\n- Swift Strike\n- Pack Leader\n\nThis build focuses on early game aggression and snowballing your lead. The key is to use Roar to engage, then follow up with Swift Strike for burst damage.\n\nWhat builds are you guys running?'
        },
        {
          title: 'Bear vs Shark matchup tips?',
          content: 'I keep struggling when I play Bear against Shark players. They just kite me endlessly and I can never close the gap.\n\nAny tips for this matchup? Should I be taking different talents?'
        },
        {
          title: 'Eagle mobility tech',
          content: 'Discovered a cool tech with Eagle - if you use Dive during your glide animation, you can cover WAY more distance than normal.\n\nTry it in practice mode, it\'s a game changer for positioning!'
        }
      ],
      'competitive-play': [
        {
          title: 'Hit Diamond for the first time!',
          content: 'Just hit Diamond in 1v1 ranked! 🎉\n\nIt took me 3 seasons but I finally made it. Special shoutout to everyone in this community who shared tips and strategies.\n\nFor anyone grinding: consistency is key. Focus on improving one aspect of your gameplay at a time rather than trying to fix everything at once.'
        },
        {
          title: 'Current 3v3 meta discussion',
          content: 'What\'s everyone running for 3v3 ranked right now?\n\nI\'ve been seeing a lot of Lion/Bear/Eagle comps lately. The tankiness + mobility combo seems really strong.\n\nWhat are you guys seeing at your rank?'
        },
        {
          title: 'Tournament this weekend?',
          content: 'Is anyone else planning to participate in the community tournament this Saturday?\n\nI\'m putting together a 3v3 team. Looking for 2 more players around Platinum rank. DM me if interested!'
        }
      ],
      'bug-reports': [
        {
          title: 'Matchmaking stuck at "Finding Match"',
          content: 'Anyone else experiencing this? I\'ve been stuck on "Finding Match" for 10+ minutes multiple times today.\n\n**Platform:** PC\n**Game Mode:** 2v2 Ranked\n**Region:** NA\n**Time:** Around 3 PM EST\n\nRestarting the game fixes it temporarily but it keeps happening.'
        },
        {
          title: 'Visual bug with Porcupine quills',
          content: 'Sometimes when Porcupine uses their ultimate, the quill projectiles don\'t render properly. You can still get hit by them (ouch!) but you can\'t see them.\n\nHappened 3 times in my last 5 matches. Pretty frustrating in ranked.'
        }
      ],
      'feedback-suggestions': [
        {
          title: 'Suggestion: Practice mode vs AI',
          content: 'Would love to see a practice mode where we can fight against AI controlled characters to practice matchups.\n\nCurrent practice mode is great for learning combos, but fighting a moving target would be even better for improvement.\n\nThoughts?'
        },
        {
          title: 'Add replay system?',
          content: 'It would be amazing if we could watch replays of our matches. Being able to review games and see what went wrong would help so much with improvement.\n\nI know it\'s probably a lot of work, but this would be huge for the competitive scene!'
        }
      ]
    };

    // Create posts for each board
    console.log('Creating forum posts...');
    let totalPosts = 0;
    let totalComments = 0;

    for (const board of boards) {
      const templates = postTemplates[board.slug] || [];
      
      for (const template of templates) {
        const author = users[Math.floor(Math.random() * users.length)];
        const createdDate = new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)); // Random date in past 14 days
        
        // Determine if post should be pinned (first post in each board)
        const isPinned = totalPosts < boards.length;
        
        const post = await ForumPost.create({
          board: board._id,
          author: author._id,
          title: template.title,
          content: template.content,
          slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          votes: {
            upvotes: [],
            downvotes: []
          },
          isPinned: isPinned,
          isLocked: false,
          isDeleted: false,
          stats: {
            commentCount: 0,
            viewCount: Math.floor(Math.random() * 500) + 50,
            lastActivityDate: createdDate
          },
          createdAt: createdDate,
          updatedAt: createdDate
        });

        // Add random upvotes
        const numUpvotes = Math.floor(Math.random() * 15) + 5;
        for (let i = 0; i < numUpvotes; i++) {
          const voter = users[Math.floor(Math.random() * users.length)];
          if (!post.votes.upvotes.includes(voter._id)) {
            post.votes.upvotes.push(voter._id);
          }
        }

        // Add random downvotes (fewer than upvotes)
        const numDownvotes = Math.floor(Math.random() * 3);
        for (let i = 0; i < numDownvotes; i++) {
          const voter = users[Math.floor(Math.random() * users.length)];
          if (!post.votes.downvotes.includes(voter._id) && !post.votes.upvotes.includes(voter._id)) {
            post.votes.downvotes.push(voter._id);
          }
        }

        await post.save();

        // Create 2-5 comments per post
        const numComments = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < numComments; i++) {
          const commenter = users[Math.floor(Math.random() * users.length)];
          const commentDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
          
          const commentTexts = [
            'Great post! I totally agree with your points here.',
            'Thanks for sharing this! Very helpful.',
            'Interesting perspective. I hadn\'t thought about it that way.',
            'This helped me a lot. Appreciate the detailed write-up!',
            'Anyone else have experience with this?',
            'I had the same issue! Glad I\'m not alone.',
            'Have you tried the alternative approach? Works better for me.',
            'Solid advice. Definitely going to try this out.',
            'Thanks for taking the time to write this up!',
            'Could you elaborate more on this part?'
          ];

          const comment = await ForumComment.create({
            post: post._id,
            author: commenter._id,
            content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
            parentComment: null,
            votes: {
              upvotes: [],
              downvotes: []
            },
            isDeleted: false,
            createdAt: commentDate,
            updatedAt: commentDate
          });

          // Add random upvotes to comment
          const commentUpvotes = Math.floor(Math.random() * 8) + 1;
          for (let j = 0; j < commentUpvotes; j++) {
            const voter = users[Math.floor(Math.random() * users.length)];
            if (!comment.votes.upvotes.includes(voter._id)) {
              comment.votes.upvotes.push(voter._id);
            }
          }

          await comment.save();

          // Update post comment count
          post.stats.commentCount += 1;
          post.stats.lastActivityDate = commentDate;
          totalComments += 1;

          // 30% chance to add a reply to this comment
          if (Math.random() > 0.7) {
            const replier = users[Math.floor(Math.random() * users.length)];
            const replyDate = new Date(commentDate.getTime() + Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000));
            
            const replyTexts = [
              'I agree with this!',
              'Same here, works great.',
              'Thanks for the tip!',
              'Good point.',
              'Exactly what I was thinking.'
            ];

            const reply = await ForumComment.create({
              post: post._id,
              author: replier._id,
              content: replyTexts[Math.floor(Math.random() * replyTexts.length)],
              parentComment: comment._id,
              votes: {
                upvotes: [],
                downvotes: []
              },
              isDeleted: false,
              createdAt: replyDate,
              updatedAt: replyDate
            });

            // Add upvotes to reply
            const replyUpvotes = Math.floor(Math.random() * 5) + 1;
            for (let j = 0; j < replyUpvotes; j++) {
              const voter = users[Math.floor(Math.random() * users.length)];
              if (!reply.votes.upvotes.includes(voter._id)) {
                reply.votes.upvotes.push(voter._id);
              }
            }

            await reply.save();
            post.stats.commentCount += 1;
            totalComments += 1;
          }
        }

        await post.save();

        // Update board stats
        board.stats.totalPosts += 1;
        board.stats.totalComments += post.stats.commentCount;
        board.stats.lastPostDate = createdDate;
        board.stats.lastPostedBy = author._id;

        totalPosts += 1;
      }

      await board.save();
    }

    console.log(`✅ Created ${totalPosts} forum posts`);
    console.log(`✅ Created ${totalComments} comments`);

    console.log('\n📊 Forum Seed Summary:');
    console.log(`   - ${boards.length} boards`);
    console.log(`   - ${totalPosts} posts`);
    console.log(`   - ${totalComments} comments`);
    console.log('\n✅ Forum data seeded successfully!');
    console.log('\n💡 You can now browse the forum at: http://localhost:3000/forum');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding forum data:', error);
    process.exit(1);
  }
};

seedForumData();