import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';

const { NativeLeapSDK } = NativeModules;

interface LeapSDKModule {
  loadModel(modelPath: string): Promise<boolean>;
  createConversation(): Promise<boolean>;
  generateResponse(input: string): Promise<{ text: string }>;
  cancelGeneration(): Promise<boolean>;
  getHistory(): Promise<{ messages: any[] }>;
  cleanup(): Promise<boolean>;
}

interface ChunkEvent {
  text: string;
  type: 'chunk' | 'reasoning';
}

interface CompleteEvent {
  text: string;
}

interface ErrorEvent {
  error: string;
}

class LeapSDKWrapper {
  private eventEmitter: NativeEventEmitter;
  private subscriptions: EmitterSubscription[] = [];

  constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeLeapSDK);
  }

  /**
   * Load a model bundle from the specified path
   * @param modelPath Path to the model bundle file (e.g., "/data/local/tmp/leap/model.bundle")
   */
  async loadModel(modelPath: string): Promise<boolean> {
    console.log(NativeLeapSDK);
    return NativeLeapSDK.loadModel(modelPath);
  }

  /**
   * Create a new conversation
   */
  async createConversation(): Promise<boolean> {
    return NativeLeapSDK.createConversation();
  }

  /**
   * Generate a response from the model
   * @param input User input text
   * @param onChunk Callback for each chunk of generated text
   * @param onComplete Callback when generation is complete
   * @param onError Callback for errors
   * @returns Promise that resolves with the complete response
   */
  async generateResponse(
    input: string,
    onChunk?: (chunk: ChunkEvent) => void,
    onComplete?: (complete: CompleteEvent) => void,
    onError?: (error: ErrorEvent) => void
  ): Promise<{ text: string }> {
    // Set up event listeners
    if (onChunk) {
      const sub = this.eventEmitter.addListener('onChunk', onChunk);
      this.subscriptions.push(sub);
    }

    if (onComplete) {
      const sub = this.eventEmitter.addListener('onComplete', onComplete);
      this.subscriptions.push(sub);
    }

    if (onError) {
      const sub = this.eventEmitter.addListener('onError', onError);
      this.subscriptions.push(sub);
    }

    try {
      const result = await NativeLeapSDK.generateResponse(input);
      
      // Clean up listeners after completion
      this.removeAllListeners();
      
      return result;
    } catch (error) {
      this.removeAllListeners();
      throw error;
    }
  }

  /**
   * Cancel the current generation
   */
  async cancelGeneration(): Promise<boolean> {
    this.removeAllListeners();
    return NativeLeapSDK.cancelGeneration();
  }

  /**
   * Get conversation history
   */
  async getHistory(): Promise<{ messages: any[] }> {
    return NativeLeapSDK.getHistory();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<boolean> {
    this.removeAllListeners();
    return NativeLeapSDK.cleanup();
  }

  /**
   * Remove all event listeners
   */
  private removeAllListeners(): void {
    this.subscriptions.forEach(sub => sub.remove());
    this.subscriptions = [];
  }
}

export default new LeapSDKWrapper();

