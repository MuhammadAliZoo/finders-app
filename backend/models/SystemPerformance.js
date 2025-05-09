import mongoose from 'mongoose';

const systemPerformanceSchema = new mongoose.Schema({
  totalRequests: { type: Number, required: true },
  averageResponseTime: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SystemPerformance', systemPerformanceSchema); 