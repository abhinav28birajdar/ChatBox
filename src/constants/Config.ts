import { ServerCategory } from '@/types';

export const serverCategoryConfig: Record<ServerCategory, { label: string; icon: string; color: string }> = {
    gaming: { label: 'Gaming', icon: 'game-controller', color: '#FF6B6B' },
    education: { label: 'Education', icon: 'school', color: '#4ECDC4' },
    technology: { label: 'Technology', icon: 'code-slash', color: '#45B7D1' },
    art: { label: 'Art & Creative', icon: 'color-palette', color: '#F7DC6F' },
    music: { label: 'Music', icon: 'musical-notes', color: '#BB8FCE' },
    sports: { label: 'Sports', icon: 'football', color: '#82E0AA' },
    entertainment: { label: 'Entertainment', icon: 'film', color: '#F0B27A' },
    community: { label: 'Community', icon: 'people', color: '#85C1E9' },
    other: { label: 'Other', icon: 'apps', color: '#AEB6BF' },
};

export const interestTags = [
    { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
    { id: 'music', label: 'Music', icon: 'musical-notes-outline' },
    { id: 'art', label: 'Art & Design', icon: 'color-palette-outline' },
    { id: 'technology', label: 'Technology', icon: 'code-slash-outline' },
    { id: 'education', label: 'Education', icon: 'school-outline' },
    { id: 'sports', label: 'Sports', icon: 'football-outline' },
    { id: 'entertainment', label: 'Entertainment', icon: 'film-outline' },
    { id: 'science', label: 'Science', icon: 'flask-outline' },
    { id: 'fitness', label: 'Fitness', icon: 'barbell-outline' },
    { id: 'photography', label: 'Photography', icon: 'camera-outline' },
    { id: 'cooking', label: 'Cooking', icon: 'restaurant-outline' },
    { id: 'travel', label: 'Travel', icon: 'airplane-outline' },
];
