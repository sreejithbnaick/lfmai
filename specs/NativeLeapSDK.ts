import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

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

interface GenerationCallbacks {
    onChunk?: (chunk: ChunkEvent) => void;
    onComplete?: (complete: { text: string }) => void;
    onError?: (error: { error: string }) => void;
}

export interface Spec extends TurboModule {
    loadModel(modelPath: string): Promise<boolean>
    createConversation(): Promise<boolean>
    generateResponse(input: string): Promise<string>
    cancelGeneration(): Promise<boolean>
    getHistory(): Promise<any[]>
    cleanup(): Promise<boolean>
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeLeapSDK')