exports.completeItemClaim = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { completed, userId, isFinder } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (completed) {
      // Update item status
      item.status = 'returned';
      item.returnedAt = new Date();
      await item.save();

      // Update user stats
      if (isFinder) {
        // Update finder's stats
        await User.findByIdAndUpdate(userId, {
          $inc: {
            itemsFound: 1,
            itemsReturned: 1,
            totalRewards: item.reward || 0
          }
        });

        // Update requester's stats
        await User.findByIdAndUpdate(item.owner, {
          $inc: { itemsRecovered: 1 }
        });
      } else {
        // Update requester's stats
        await User.findByIdAndUpdate(userId, {
          $inc: { itemsRecovered: 1 }
        });

        // Update finder's stats
        await User.findByIdAndUpdate(item.finder, {
          $inc: {
            itemsFound: 1,
            itemsReturned: 1,
            totalRewards: item.reward || 0
          }
        });
      }
    } else {
      // If not completed, mark as lost for the requester
      await User.findByIdAndUpdate(item.owner, {
        $inc: { itemsLost: 1 }
      });
    }

    res.json({ message: 'Item claim status updated successfully' });
  } catch (error) {
    console.error('Error completing item claim:', error);
    res.status(500).json({ message: 'Error completing item claim' });
  }
}; 