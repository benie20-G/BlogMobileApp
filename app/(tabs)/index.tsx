import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NetworkError from '../components/NetworkError';
import api, { Post } from '../services/api';

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (params.newPost) {
      try {
        const newPost = JSON.parse(params.newPost as string) as Post;
        setPosts(prevPosts => {
          const filteredPosts = prevPosts.filter(post => post.id !== newPost.id);
          return [newPost, ...filteredPosts];
        });
      } catch (error) {
        console.error('Failed to parse new post:', error);
      }
    }
  }, [params.newPost, params.timestamp]);

  const loadPosts = async () => {
    try {
      setIsOffline(false);
      const data = await api.getPosts();
      setPosts(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('No response from server')) {
        setIsOffline(true);
      }
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleDeletePost = async (id: number) => {
    try {
      await api.deletePost(id);
      setPosts(posts.filter(post => post.id !== id));
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete post');
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/post/${item.id}`)}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleDeletePost(item.id!)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.postBody} numberOfLines={2}>
        {item.body}
      </Text>
    </TouchableOpacity>
  );

  if (isOffline) {
    return <NetworkError onRetry={loadPosts} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Posts</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-post')}
        >
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <Text style={styles.loadingText}>Loading posts...</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => `post-${item.id}-${item.userId}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  postBody: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
