import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Item } from '../types/item';

export const useItemVisibility = (isRareItem: boolean = false) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both found and lost items that are available
      const [{ data: foundItems, error: foundError }, { data: lostItems, error: lostError }] = await Promise.all([
        supabase
          .from('items')
          .select('*')
          .eq('isRareItem', isRareItem)
          .eq('status', 'available') // Only show available items
          .order('created_at', { ascending: false }),
        supabase
          .from('requests')
          .select('*')
          .eq('isRareItem', isRareItem)
          .eq('status', 'searching') // Only show items still being searched for
          .order('created_at', { ascending: false })
      ]);

      if (foundError) throw foundError;
      if (lostError) throw lostError;

      // Merge and sort by created_at
      const merged = [...(foundItems || []), ...(lostItems || [])].sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
      });

      setItems(merged);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to item status changes
  useEffect(() => {
    const itemsSubscription = supabase
      .channel('items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        () => {
          fetchItems(); // Refetch items when any item changes
        }
      )
      .subscribe();

    const requestsSubscription = supabase
      .channel('requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        () => {
          fetchItems(); // Refetch items when any request changes
        }
      )
      .subscribe();

    fetchItems();

    return () => {
      itemsSubscription.unsubscribe();
      requestsSubscription.unsubscribe();
    };
  }, [isRareItem]);

  return { items, loading, error, refetch: fetchItems };
}; 