import axios from 'axios';
import type { Project, Style } from '../types';

const API_BASE = 'http://192.168.1.85:5000/api/fs';

export const filesystemService = {
  // Projects
  async listProjects(): Promise<Project[]> {
    const response = await axios.get(`${API_BASE}/projects`);
    return response.data;
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await axios.get(`${API_BASE}/projects/${projectId}`);
    return response.data;
  },

  async createProject(data: {
    name: string;
    style: string;
  }): Promise<Project> {
    const response = await axios.post(`${API_BASE}/projects`, data);
    return response.data;
  },

  async updateProject(
    projectId: string,
    data: {
      name?: string;
      style?: string;
      rawLyrics?: string;
      enhancedLyrics?: string;
    }
  ): Promise<void> {
    await axios.put(`${API_BASE}/projects/${projectId}`, data);
  },

  async saveGeneration(
    projectId: string,
    generationData: any
  ): Promise<{ success: boolean; attempt: number }> {
    const response = await axios.post(
      `${API_BASE}/projects/${projectId}/generations`,
      generationData
    );
    return response.data;
  },

  // Styles
  async listStyles(): Promise<Style[]> {
    const response = await axios.get(`${API_BASE}/styles`);
    return response.data;
  },

  // Templates
  async getGPTPrompt(): Promise<string> {
    const response = await axios.get(`${API_BASE}/templates/gpt-prompt`);
    return response.data.prompt;
  },
};
