import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  profilePicture: string;
  coverPhoto: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedDate: string;
  userType: 'individual' | 'creator' | 'business' | 'professional';
}

export default function UserProfileScreen() {
  const router = useRouter();
  
  // Mock user data - in real app, this would come from state management or API
  const [user] = useState<UserProfile>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    username: '@johndoe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    bio: 'Software Developer | Tech Enthusiast | Coffee Lover ☕\n\nBuilding amazing mobile experiences with React Native. Always learning something new!',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    profilePicture: '',
    coverPhoto: '',
    isVerified: true,
    followersCount: 1247,
    followingCount: 328,
    postsCount: 156,
    joinedDate: 'January 2023',
    userType: 'individual'
  });

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleProfilePhoto = () => {
    router.push('/profile/change-photo');
  };

  const handleFollowers = () => {
    router.push('/profile/followers');
  };

  const handleFollowing = () => {
    router.push('/profile/following');
  };

  const handlePosts = () => {
    router.push('/profile/posts');
  };

  const handleQRCode = () => {
    Alert.alert('QR Code', 'QR Code feature coming soon!');
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share profile feature coming soon!');
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Profile</ThemedText>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareIcon}>📤</Text>
            </TouchableOpacity>
          </View>

          {/* Cover Photo */}
          <View style={styles.coverPhotoContainer}>
            <View style={styles.coverPhoto}>
              <Text style={styles.coverPhotoPlaceholder}>📷</Text>
            </View>
          </View>

          {/* Profile Picture & Basic Info */}
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profilePictureContainer} onPress={handleProfilePhoto}>
              <View style={styles.profilePicture}>
                <Text style={styles.profilePicturePlaceholder}>👤</Text>
              </View>
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.nameSection}>
              <View style={styles.nameRow}>
                <ThemedText style={styles.fullName}>
                  {user.firstName} {user.lastName}
                </ThemedText>
                {user.isVerified && (
                  <Text style={styles.verifiedBadge}>✓</Text>
                )}
              </View>
              <ThemedText style={styles.username}>{user.username}</ThemedText>
              <ThemedText style={styles.joinedDate}>Joined {user.joinedDate}</ThemedText>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrButton} onPress={handleQRCode}>
                <Text style={styles.qrButtonText}>📱</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          {user.bio && (
            <View style={styles.bioSection}>
              <ThemedText style={styles.bio}>{user.bio}</ThemedText>
            </View>
          )}

          {/* Location & Website */}
          <View style={styles.detailsSection}>
            {user.location && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <ThemedText style={styles.detailText}>{user.location}</ThemedText>
              </View>
            )}
            {user.website && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🔗</Text>
                <ThemedText style={styles.detailLink}>{user.website}</ThemedText>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <TouchableOpacity style={styles.statItem} onPress={handlePosts}>
              <ThemedText style={styles.statNumber}>{formatCount(user.postsCount)}</ThemedText>
              <ThemedText style={styles.statLabel}>Posts</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={handleFollowers}>
              <ThemedText style={styles.statNumber}>{formatCount(user.followersCount)}</ThemedText>
              <ThemedText style={styles.statLabel}>Followers</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={handleFollowing}>
              <ThemedText style={styles.statNumber}>{formatCount(user.followingCount)}</ThemedText>
              <ThemedText style={styles.statLabel}>Following</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>💬</Text>
              <ThemedText style={styles.actionTitle}>My Posts</ThemedText>
              <ThemedText style={styles.actionSubtitle}>View and manage your posts</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>💾</Text>
              <ThemedText style={styles.actionTitle}>Saved</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Your bookmarked content</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <ThemedText style={styles.actionTitle}>Analytics</ThemedText>
              <ThemedText style={styles.actionSubtitle}>View your profile insights</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
  },
  coverPhotoContainer: {
    height: 120,
    marginHorizontal: 20,
    marginBottom: 50,
  },
  coverPhoto: {
    flex: 1,
    backgroundColor: '#E5E5E7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPhotoPlaceholder: {
    fontSize: 32,
    opacity: 0.6,
  },
  profileSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    marginTop: -50,
  },
  profilePicturePlaceholder: {
    fontSize: 40,
    opacity: 0.6,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 14,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 20,
    color: '#007AFF',
  },
  username: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 14,
    opacity: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  qrButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qrButtonText: {
    fontSize: 14,
  },
  bioSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailLink: {
    fontSize: 14,
    color: '#007AFF',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E7',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  quickActions: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    flex: 1,
  },
  actionSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    position: 'absolute',
    left: 56,
    bottom: 16,
  },
});