#include <iostream>
#include <string>
#include <boost/multiprecision/cpp_int.hpp>

using namespace std;

boost::multiprecision::cpp_int factorial (int x) {
  if (x == 0) return 1;
  return x * factorial(x - 1);
}

int main () {
  string m_str, n_str; cin >> m_str >> n_str;
  
  try {
    int m = stoi(m_str);
    int n = stoi(n_str);
  } catch (invalid_argument e) {
    return 100;
  }
  
  int m = stoi(m_str);
  int n = stoi(n_str);

  if (!(1 <= m and m <= 10) or !(1 <= n and n <= 10)) return 100;
 
  if ((n * m) % 2 != 0) {
    cout << "000000000" << endl;
    return 0;
  }

  boost::multiprecision::cpp_int ans = factorial(n * m) / (factorial((n * m) / 2) * factorial((n * m) / 2));
  
  if (ans.str().size() > 9) {
    cout << ans.str().substr(ans.str().size() - 9) << endl;
    return 0;
  }

  for (int i = 0; i < 9 - ans.str().size(); i++) cout << "0";
  cout << ans.str() << endl;

  return 0;
}
