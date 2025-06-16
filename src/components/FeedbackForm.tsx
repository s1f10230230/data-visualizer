import React, { useState } from "react";
import { Card, Form, Input, Button, Select, message, Collapse } from "antd";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface FeedbackFormProps {
  onSubmit: (feedback: {
    type: string;
    title: string;
    description: string;
    contact?: string;
  }) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      message.success("フィードバックを送信しました。ありがとうございます！");
      form.resetFields();
    } catch (error) {
      message.error("送信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="card fade-in mt-4">
      <Collapse defaultActiveKey={[]}>
        <Panel
          header={
            <div className="flex items-center">
              <MessageOutlined className="mr-2" />
              <span>フィードバックを送信</span>
            </div>
          }
          key="1"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="feedback-form"
            size="small"
          >
            <Form.Item
              name="type"
              label="種類"
              rules={[{ required: true, message: "種類を選択してください" }]}
            >
              <Select placeholder="種類を選択">
                <Option value="feature">新機能の要望</Option>
                <Option value="improvement">改善案</Option>
                <Option value="bug">バグ報告</Option>
                <Option value="other">その他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="タイトル"
              rules={[
                { required: true, message: "タイトルを入力してください" },
              ]}
            >
              <Input placeholder="簡潔なタイトルを入力" />
            </Form.Item>

            <Form.Item
              name="description"
              label="詳細"
              rules={[{ required: true, message: "詳細を入力してください" }]}
            >
              <TextArea rows={3} placeholder="詳細な内容を入力してください" />
            </Form.Item>

            <Form.Item name="contact" label="連絡先（任意）">
              <Input placeholder="メールアドレスなどを入力" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                className="w-full"
              >
                送信
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default FeedbackForm;
