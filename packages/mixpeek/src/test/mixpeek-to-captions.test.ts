import {expect, test, describe} from 'bun:test';
import {
  	mixpeekToCaptions,
  	extractTranscript,
  	extractScenes,
} from '../mixpeek-to-captions';
import type {MixpeekVideoAnalysis} from '../types';

const mockAnalysis: MixpeekVideoAnalysis = {
  	id: 'test-analysis-1',
  	sourceUrl: 'https://example.com/video.mp4',
  	duration: 60,
  	fps: 30,
  	segments: [
      {
        			startTime: 0,
        			endTime: 5,
        			text: 'Hello, welcome to the video.',
        			sceneDescription: 'Person speaking at a desk',
        			confidence: 0.95,
      },
      {
        			startTime: 5,
        			endTime: 12,
        			text: 'Today we will discuss important topics.',
        			sceneDescription: 'Presentation slide shown',
        			detectedObjects: ['laptop', 'presentation'],
        			confidence: 0.92,
      },
      {
        			startTime: 12,
        			endTime: 20,
        			text: 'Let me show you a demonstration.',
        			sceneDescription: 'Screen recording of software',
        			confidence: 0.88,
      },
      	],
  	transcript: 'Hello, welcome to the video. Today we will discuss important topics. Let me show you a demonstration.',
  	summary: 'A video introduction and demonstration',
  	tags: ['tutorial', 'demo'],
  	createdAt: '2024-01-15T10:00:00Z',
};

describe('mixpeekToCaptions', () => {
  	test('should convert segments to captions', () => {
      		const {captions} = mixpeekToCaptions({analysis: mockAnalysis});

         		expect(captions).toHaveLength(3);
      		expect(captions[0].text).toBe('Hello, welcome to the video.');
      		expect(captions[0].startMs).toBe(0);
      		expect(captions[0].endMs).toBe(5000);
    });

         	test('should include confidence scores', () => {
            		const {captions} = mixpeekToCaptions({analysis: mockAnalysis});

               		expect(captions[0].confidence).toBe(0.95);
            		expect(captions[1].confidence).toBe(0.92);
          });

         	test('should include scene descriptions when option is set', () => {
            		const {captions} = mixpeekToCaptions({
                  			analysis: mockAnalysis,
                  			options: {includeSceneDescriptions: true},
                });

               		expect(captions[0].text).toContain('[Person speaking at a desk]');
          });

         	test('should include detected objects when option is set', () => {
            		const {captions} = mixpeekToCaptions({
                  			analysis: mockAnalysis,
                  			options: {includeDetectedObjects: true},
                });

               		expect(captions[1].text).toContain('[Objects: laptop, presentation]');
          });

         	test('should sort captions by start time', () => {
            		const unsortedAnalysis: MixpeekVideoAnalysis = {
                  			...mockAnalysis,
                  			segments: [
                          {startTime: 10, endTime: 15, text: 'Third'},
                          {startTime: 0, endTime: 5, text: 'First'},
                          {startTime: 5, endTime: 10, text: 'Second'},
                          			],
                };

               		const {captions} = mixpeekToCaptions({analysis: unsortedAnalysis});

               		expect(captions[0].text).toBe('First');
            		expect(captions[1].text).toBe('Second');
            		expect(captions[2].text).toBe('Third');
          });

         	test('should skip segments with no text', () => {
            		const noTextAnalysis: MixpeekVideoAnalysis = {
                  			...mockAnalysis,
                  			segments: [
                          {startTime: 0, endTime: 5, text: ''},
                          {startTime: 5, endTime: 10, text: 'Has text'},
                          {startTime: 10, endTime: 15, text: '   '},
                          			],
                };

               		const {captions} = mixpeekToCaptions({analysis: noTextAnalysis});

               		expect(captions).toHaveLength(1);
            		expect(captions[0].text).toBe('Has text');
          });
});

describe('extractTranscript', () => {
  	test('should return full transcript when available', () => {
      		const transcript = extractTranscript(mockAnalysis);
      		expect(transcript).toBe(mockAnalysis.transcript);
    });

         	test('should concatenate segment texts when transcript is not available', () => {
            		const noTranscript: MixpeekVideoAnalysis = {
                  			...mockAnalysis,
                  			transcript: undefined,
                };

               		const transcript = extractTranscript(noTranscript);

               		expect(transcript).toContain('Hello, welcome to the video.');
            		expect(transcript).toContain('Today we will discuss important topics.');
          });
});

describe('extractScenes', () => {
  	test('should extract all scene descriptions', () => {
      		const scenes = extractScenes(mockAnalysis);

         		expect(scenes).toHaveLength(3);
      		expect(scenes[0].description).toBe('Person speaking at a desk');
      		expect(scenes[0].startTime).toBe(0);
      		expect(scenes[0].endTime).toBe(5);
    });

         	test('should skip segments without scene descriptions', () => {
            		const partialScenes: MixpeekVideoAnalysis = {
                  			...mockAnalysis,
                  			segments: [
                          {startTime: 0, endTime: 5, text: 'Text only'},
                          {startTime: 5, endTime: 10, sceneDescription: 'Has description'},
                          			],
                };

               		const scenes = extractScenes(partialScenes);

               		expect(scenes).toHaveLength(1);
            		expect(scenes[0].description).toBe('Has description');
          });
});
