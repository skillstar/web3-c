import { HistoryRecord }  from "@/types"
// 定义组件的Props类型  
type LearningHistoryProps = {  
  history: HistoryRecord[];  // 注意这里是数组  
}; 
export default function LearningHistory({ history }: LearningHistoryProps) {
  return (
   <div className="overflow-x-auto">  
  <table className="table w-full">  
    <thead>  
      <tr>  
        <th>Date</th>  
        <th>Activity</th>  
        <th>Mining Reward</th>  
      </tr>  
    </thead>  
    <tbody>  
      {history.map((record, index) => (  
        <tr key={index}>  
          <td>{record.date}</td>  
          <td>  
            {record.type === 'course-completed' && `Completed: ${record.courseTitle}`}  
            {record.type === 'note-published' && `Published Learning Note`}  
            {record.type === 'quiz-passed' && `Passed Quiz: ${record.quizTitle}`}  
            {record.type === 'discussion' && `Contributed to Discussion`}  
          </td>  
          <td className="text-primary">+{record.miningReward} YD</td>  
        </tr>  
      ))}  
    </tbody>  
  </table>  
</div>
  );
}