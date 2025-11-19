// App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Keyboard } from 'react-native';

import { leapLiquidAI } from './leapLiquidAI'

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    const initializeSDK = async () => {
      if (isInitialized || isInitializing) return;

      setIsInitializing(true);
      try {
        // Default model path - can be customized
        const modelPath = '/data/local/tmp/leap/model.bundle';
        await leapLiquidAI.initialize(modelPath);
        await leapLiquidAI.createConversation();

        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error: any) {
        console.error('Failed to initialize Leap SDK:', error);
        const errorMessage = error?.message || 'Unknown error';

      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    initializeSDK();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (leapLiquidAI.isReady()) {
        leapLiquidAI.cleanup().catch(console.error);
      }
    };
  }, []);

  const handleSendPress = async () => {
    if (!inputText.trim() || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputText.trim();
    setInputText('');

    // Create a placeholder message for the streaming response
    const responseId = (Date.now() + 1).toString();
    setCurrentResponseId(responseId);
    const assistantMessage: Message = {
      id: responseId,
      text: '',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await leapLiquidAI.sendMessage(userInput, {
        onChunk: (chunk) => {
          // Update the assistant message with streaming chunks
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId
                ? { ...msg, text: msg.text + chunk.text }
                : msg
            )
          );
        },
        onComplete: (complete) => {
          // Final update with complete response
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId
                ? { ...msg, text: complete.text }
                : msg
            )
          );
        },
        onError: (error) => {
          console.error('Generation error:', error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId
                ? { ...msg, text: `Error: ${error.error}` }
                : msg
            )
          );
        },
      });
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId
            ? { ...msg, text: `Sorry, I encountered an error: ${errorMessage}` }
            : msg
        )
      );
    } finally {
      setCurrentResponseId(null);
    }
  };

  const handleTextInputChange = (text: string) => {
    setInputText(text);
  };

  return (
    <View style={styles.container}>
      <View >
        <Text>AI Chat</Text>
        {isInitializing && (
          <Text>
            Initializing model...
          </Text>
        )}
        {!isInitialized && !isInitializing && (
          <Text>
            Model not loaded
          </Text>
        )}
        {isInitialized && (
          <Text>
            Ready
          </Text>
        )}
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `message-${index}`}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={[styles.message, item.role === 'user'  ? styles.userMessage : styles.aiMessage]}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleTextInputChange}
          placeholder="Type your message..."
          onSubmitEditing={handleSendPress}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  messageContainer: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  message: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#DCF8C6',
  },
  aiMessage: {
    backgroundColor: '#D1C4E9',
    marginLeft: 'auto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#007BFF',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;


