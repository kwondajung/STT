import { AudioRecorderState } from "@/app/types/chatBotType/chatBotType";
import { convertSpeechToText } from "@/utils/chatbot/chatBotApi";
import { useState, useEffect } from "react";

export const useAudioRecorder = (callback: (text: string) => void) => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    mediaRecorder: null,
    chunks: []
  });

  // 브라우저 환경 체크
  const checkEnvironment = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    return { isIOS, isSafari };
  };

  // 오디오 설정 - iOS를 위해 최소한의 설정만 사용
  const getAudioConstraints = () => {
    return {
      channelCount: 1,
      sampleRate: 44100 // iOS 기본값
    };
  };

  const startRecording = async () => {
    try {
      const { isIOS, isSafari } = checkEnvironment();
      callback(`환경체크: ${isIOS ? "iOS" : "다른 OS"}, ${isSafari ? "Safari" : "다른 브라우저"}`);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        callback("이 브라우저는 마이크 기능을 지원하지 않습니다.");
        return;
      }

      callback("마이크 권한을 요청합니다...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: getAudioConstraints()
      });

      callback("마이크 권한 획득 성공!");

      // MIME 타입 설정 (iOS는 wav 사용)
      const { isIOS: isIOSDevice } = checkEnvironment();
      let mimeType = isIOSDevice ? "audio/wav" : "audio/webm";

      callback(`선택된 오디오 형식: ${mimeType}`);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : "audio/wav",
        audioBitsPerSecond: isIOSDevice ? 64000 : 128000
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunks, { type: mimeType });

          if (audioBlob.size < 1000) {
            callback("녹음된 내용이 너무 짧습니다. 다시 시도해주세요.");
            return;
          }

          const fileExtension = mimeType.includes("wav") ? "wav" : "webm";
          const audioFile = new File([audioBlob], `audio.${fileExtension}`, {
            type: mimeType
          });

          callback("음성을 텍스트로 변환 중...");

          const text = await convertSpeechToText(audioFile);

          if (text && text.trim() && !text.includes("MBC 뉴스")) {
            callback(text);
          } else {
            callback("음성 인식에 실패했습니다. 다시 시도해주세요.");
          }
        } catch (error) {
          callback(`음성 변환 중 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
        } finally {
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(500); // 더 작은 타임슬라이스 사용
      callback("녹음이 시작되었습니다.");

      setRecorderState({
        isRecording: true,
        mediaRecorder,
        chunks
      });
    } catch (error) {
      if (error instanceof Error) {
        callback(`마이크 접근 오류: ${error.message}`);
      } else {
        callback("마이크 접근에 실패했습니다. 브라우저 권한을 확인해주세요.");
      }
      setRecorderState({
        isRecording: false,
        mediaRecorder: null,
        chunks: []
      });
    }
  };

  const stopRecording = () => {
    if (recorderState.mediaRecorder && recorderState.isRecording) {
      callback("녹음을 중지합니다...");
      recorderState.mediaRecorder.stop();
      setRecorderState((prev) => ({ ...prev, isRecording: false }));
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (recorderState.mediaRecorder) {
        recorderState.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recorderState.mediaRecorder]);

  return {
    isRecording: recorderState.isRecording,
    startRecording,
    stopRecording
  };
};
