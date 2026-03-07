import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
    /** Optional custom fallback UI */
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global React error boundary that catches unhandled render-time errors
 * and displays a graceful fallback instead of a red crash screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // In production you would send this to a crash-reporting service
        if (__DEV__) {
            console.error('[ErrorBoundary] Caught render error:', error);
            console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
        }
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <Ionicons name="warning-outline" size={80} color="#E53E3E" />
                    <Text style={styles.title}>Something went wrong</Text>
                    <ScrollView style={styles.messageContainer} contentContainerStyle={styles.messageContent}>
                        <Text style={styles.message}>
                            {this.state.error?.message ?? 'An unexpected error occurred.'}
                        </Text>
                    </ScrollView>
                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    messageContainer: {
        maxHeight: 120,
        width: '100%',
        marginBottom: 32,
    },
    messageContent: {
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
