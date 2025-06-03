import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Heart, Users, TrendingUp, User, Shield } from "lucide-react";

export default function Landing() {
  const loginAsDemo = (userId: string) => {
    localStorage.setItem('demo-user-id', userId);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Coins className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">K-point</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            社内で感謝の気持ちを形にする。チームメンバー同士でK-pointを贈り合い、
            日々の貢献を可視化します。
          </p>
          
          {/* Demo Login Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto mb-8">
            <h3 className="text-lg font-semibold mb-4">デモアカウントでログイン</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Demo Users */}
              <div className="space-y-3">
                <h4 className="flex items-center text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  一般ユーザー
                </h4>
                <Button 
                  onClick={() => loginAsDemo('demo1')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  田中 太郎（営業部）
                </Button>
                <Button 
                  onClick={() => loginAsDemo('demo2')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  鈴木 花子（マーケティング部）
                </Button>
              </div>
              
              {/* Admin Users */}
              <div className="space-y-3">
                <h4 className="flex items-center text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4 mr-2" />
                  管理者
                </h4>
                <Button 
                  onClick={() => loginAsDemo('admin1')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  山田 次郎（人事部）
                </Button>
                <Button 
                  onClick={() => loginAsDemo('admin2')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  佐藤 美香（IT部）
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
          >
            Replitアカウントでログイン
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle>感謝を形に</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                日々の小さな貢献から大きな成果まで、
                K-Pointで感謝の気持ちを表現できます。
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle>チーム連携</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                部署を超えたコラボレーションを促進し、
                組織全体のエンゲージメントを向上させます。
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
              <CardTitle>成果の可視化</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                送受信されるポイントを通じて、
                個人やチームの貢献度を客観的に評価できます。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center mb-8">使い方</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">ログイン</h3>
              <p className="text-gray-600">社内アカウントでログインして、K-Pointシステムにアクセス</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">送付</h3>
              <p className="text-gray-600">同僚の貢献に対して1〜3ポイントと感謝メッセージを送付</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">可視化</h3>
              <p className="text-gray-600">ダッシュボードで送受信履歴や部署ランキングを確認</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
