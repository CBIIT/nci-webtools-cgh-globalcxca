import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";

export default function About() {
  return (
    <div className="bg-light py-4">
      <Container>
        <h1 className="text-center h2">
          Description and sources for scenario parameters
        </h1>
        <Card className="mb-2 mt-2">
          <Card.Body className="pt-2">
            <h4 className="text-center mb-1">Epidemiological Context</h4>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Low Value</th>
                  <th>High Value</th>
                  <th>Default Value</th>
                  <th>Justification</th>
                  <th>Sources</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Prevalence of CIN2/3 in population for cervical screening
                  </td>
                  <td>0%</td>
                  <td>5%</td>
                  <td>2%</td>
                  <td>
                    Population-based prevalence studies suggest 1-3% prevalence,
                    depending upon previous screening history and
                    immunocompetency challenges in the population.
                  </td>
                  <td>
                    <p>
                      Zhao FH, Lewkowitz AK, Hu SY, Chen F, Li LY, Zhang QM, Wu
                      RF, Li CQ, Wei LH, Xu AD, Zhang WH, Pan QJ, Zhang X,
                      Belinson JL, Sellors JW, Smith JS, Qiao YL, Franceschi S.
                      Prevalence of human papillomavirus and cervical
                      intraepithelial neoplasia in China: a pooled analysis of
                      17 population-based studies. Int J Cancer. 2012 Dec
                      15;131(12):2929-38. doi: 10.1002/ijc.27571. Epub 2012 Apr
                      24. PMID: 22488743; PMCID: PMC3435460.
                    </p>
                    <p>
                      Ting J, Kruzikas DT, Smith JS. A global review of
                      age-specific and overall prevalence of cervical lesions.
                      Int J Gynecol Cancer. 2010 Oct;20(7):1244-9. doi:
                      10.1111/igc.0b013e3181f16c5f. PMID: 21495248.
                    </p>
                    <p>
                      Vesco KK et al. Screening for Cervical Cancer: A
                      Systematic Evidence Review for the U.S. Preventive
                      Services Task Force [Internet]. Rockville (MD): Agency for
                      Healthcare Research and Quality (US); 2011 May. Report
                      No.: 11-05156-EF-1. PMID: 22132428.
                    </p>
                    <p>
                      Web Annex A. Syntheses of evidence. In: WHO guideline for
                      screening and treatment of cervical pre-cancer lesions for
                      cervical cancer prevention, second edition. Geneva: World
                      Health Organization; 2021. Licence: CC BY-NC-SA 3.0 IGO.
                    </p>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="pt-2">
            <h4 className="text-center mb-1">
              Participation in Health Services
            </h4>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Low Value</th>
                  <th>High Value</th>
                  <th>Default Value</th>
                  <th>Justification</th>
                  <th>Sources</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Interval of cervical screening in years</td>
                  <td>1</td>
                  <td>40</td>
                  <td>5</td>
                  <td>
                    Cervical cancer screening guidelines do not recommend
                    screening more frequently than every 3 years. Typically
                    screening intervals range from every 3 or 5 years to every
                    10 years, depending upon test sensitivity and program
                    success with completion of follow-up. When considering a
                    once-in-a-lifetime screening approach, enter the value 40
                    and a twice-in-a-lifetime approach should enter the value
                    20.
                  </td>
                  <td>
                    Web Annex A. Syntheses of evidence. In: WHO guideline for
                    screening and treatment of cervical pre-cancer lesions for
                    cervical cancer prevention, second edition. Geneva: World
                    Health Organization;2021. Licence: CC BY-NC-SA 3.0 IGO.
                  </td>
                </tr>
                <tr>
                  <td>Percent screening coverage</td>
                  <td>0%</td>
                  <td>100%</td>
                  <td>None</td>
                  <td>
                    This metric refers to the percent of the population that you
                    aim to reach over the course of their lifetime. Screening
                    coverage varies widely by country, geographic region,
                    resource setting, and population.
                  </td>
                  <td>
                    Bruni L, Serrano B, Roura E, Alemany L, Cowan M, Herrero R,
                    Poljak M, Murillo R, Broutet N, Riley LM, de Sanjose S.
                    Cervical cancer screening programmes and age-specific
                    coverage estimates for 202 countries and territories
                    worldwide: a review and synthetic analysis. Lancet Glob
                    Health. 2022 Aug;10(8):e1115-e1127. doi:
                    10.1016/S2214-109X(22)00241-8. PMID: 35839811; PMCID:
                    PMC9296658.
                  </td>
                </tr>
                <tr>
                  <td>
                    Percent of screen positives with triage/diagnostic test
                  </td>
                  <td>0%</td>
                  <td>100%</td>
                  <td>None</td>
                  <td>
                    This metric refers to the percent of those with an abnormal
                    result that will receive the subsequent triage or diagnostic
                    test. Follow-up rates vary widely between 25-99%, depending
                    on resources and contexts.
                  </td>
                  <td>
                    Murillo, R., et al., Cervical cancer screening programs in
                    Latin America and the Caribbean. Vaccine, 2008. 26 Suppl 11:
                    p. L37-48.
                  </td>
                </tr>
                <tr>
                  <td>Percent of triage/diagnostic test positives treated</td>
                  <td>0%</td>
                  <td>100%</td>
                  <td>None</td>
                  <td>
                    This metric refers to the percent of those with an abnormal
                    result that will receive treatment. Follow-up rates vary
                    widely between 25-99%, depending on resources and contexts.
                  </td>
                  <td>
                    Murillo, R., et al., Cervical cancer screening programs in
                    Latin America and the Caribbean. Vaccine, 2008. 26 Suppl 11:
                    p. L37-48.
                  </td>
                </tr>
                <tr>
                  <td>Percent of screen positives with triage test</td>
                  <td>0%</td>
                  <td>100%</td>
                  <td>None</td>
                  <td>
                    This metric refers to the percent of those with an abnormal
                    result that will receive the triage/diagnostic test.
                    Follow-up rates vary widely between 25-99%, depending on
                    resources and contexts.
                  </td>
                  <td>
                    Murillo, R., et al., Cervical cancer screening programs in
                    Latin America and the Caribbean. Vaccine, 2008. 26 Suppl 11:
                    p. L37-48.
                  </td>
                </tr>
                <tr>
                  <td>Percent of screen positives with diagnostic test</td>
                  <td>0%</td>
                  <td>100%</td>
                  <td>None</td>
                  <td>
                    This metric refers to the percent of those with an abnormal
                    result that will receive the triage/diagnostic test.
                    Follow-up rates vary widely between 25-99%, depending on
                    resources and contexts.
                  </td>
                  <td>
                    Murillo, R., et al., Cervical cancer screening programs in
                    Latin America and the Caribbean. Vaccine, 2008. 26 Suppl 11:
                    p. L37-48.
                  </td>
                </tr>
                <tr>
                  <td>Percent of diagnostic test positives treated</td>
                  <td>0%</td>
                  <td>100%</td>
                  <td>None</td>
                  <td>
                    This metric refers to the percent of those with an abnormal
                    result that will receive treatment. Follow-up rates vary
                    widely between 25-99%, depending on resources and contexts.
                  </td>
                  <td>
                    Murillo, R., et al., Cervical cancer screening programs in
                    Latin America and the Caribbean. Vaccine, 2008. 26 Suppl 11:
                    p. L37-48.
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body className="pt-2">
            <h4 className="text-center mb-1">
              Screening and Treatment Characteristics
            </h4>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Default Sensitivity</th>
                  <th>Default Specificity</th>
                  <th>Justification text </th>
                  <th>Sources/justification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pap test </td>
                  <td>61</td>
                  <td>90</td>
                  <td>
                    Pap test performance varies widely across settings.
                    Sensitivity can range from 25-75%, with most estimates
                    50-70%
                  </td>
                  <td>
                    <p>
                      Arbyn M, Sankaranarayanan R, Muwonge R, Keita N, Dolo A,
                      Mbalawa CG, et al. Pooled analysis of the accuracy of five
                      cervical cancer screening tests assessed in eleven studies
                      in Africa and India. Int J Cancer 2008; 123: 153-160.
                    </p>
                    <p>
                      Cuzick J, et al. Overview of the European and North
                      American studies on HPV testing in primary cervical cancer
                      screening. IJC.2006;119:1095–1101.{" "}
                    </p>
                    <p>
                      Mayrand HM, et al. Human papillomavirus DNA versus
                      papanicolaou screening tests for cervical cancer. NEJM
                      2007;357:1579-1588.{" "}
                    </p>
                    <p>
                      Almonte et al. Cervical screening by visual inspection,
                      HPV testing, liquid-based and conventional cytology in
                      Amazonian Peru. IJC 121, 706-802, 2007.{" "}
                    </p>
                    <p>Nanda K et al. Ann Intern Med 2000</p>
                    <p>
                      Web Annex A. Syntheses of evidence. In: WHO guideline for
                      screening and treatment of cervical pre-cancer lesions for
                      cervical cancer prevention, second edition. Geneva: World
                      Health Organization{" "}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>VIA (IVAA) </td>
                  <td>60</td>
                  <td>84</td>
                  <td>
                    Estimates very wide and dependent on training and continued
                    quality control. Global average about 65% sensitivity and
                    87% specificity. Estimates of test performance following a
                    positive HPV test are similarly wide.
                  </td>
                  <td>
                    <p>
                      Web Annex A. Syntheses of evidence. In: WHO guideline for
                      screening and treatment of cervical pre-cancer lesions for
                      cervical cancer prevention, second edition. Geneva: World
                      Health Organization{" "}
                    </p>
                    <p>
                      Almonte et al. Cervical screening by visual inspection,
                      HPV testing, liquid-based and conventional cytology in
                      Amazonian Peru. IJC 121, 706-802, 2007.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>HPV</td>
                  <td>90</td>
                  <td>89</td>
                  <td>
                    Estimates of HPV test performance in screening programs are
                    less variable.
                  </td>
                  <td>
                    <p>
                      Web Annex A. Syntheses of evidence. In: WHO guideline for
                      screening and treatment of cervical pre-cancer lesions for
                      cervical cancer prevention, second edition. Geneva: World
                      Health Organization{" "}
                    </p>
                    <p>
                      Cuzick J, et al. Overview of the European and North
                      American studies on HPV testing in primary cervical cancer
                      screening. IJC.2006;119:1095–1101.{" "}
                    </p>
                    <p>
                      Almonte et al. Cervical screening by visual inspection,
                      HPV testing, liquid-based and conventional cytology in
                      Amazonian Peru. IJC 121, 706-802, 2007.{" "}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>HPV16/18 </td>
                  <td>60</td>
                  <td>75</td>
                  <td></td>
                  <td>
                    <p>
                      Web Annex A. Syntheses of evidence. In: WHO guideline for
                      screening and treatment of cervical pre-cancer lesions for
                      cervical cancer prevention, second edition. Geneva: World
                      Health Organization{" "}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>Impression of colposcopy</td>
                  <td>70</td>
                  <td>75</td>
                  <td>
                    Accuracy of colposcopic impression varies widely with
                    significant bias. Most estimates of sensitivity are 50-80%
                    while estimates of specificity are 70-95%.
                  </td>
                  <td>
                    <p>
                      Brown BH, Tidy JA. The diagnostic accuracy of colposcopy -
                      A review of research methodology and impact on the
                      outcomes of quality assurance. Eur J Obstet Gynecol Reprod
                      Biol. 2019 Sep;240:182-186. doi:
                      10.1016/j.ejogrb.2019.07.003. Epub 2019 Jul 3. PMID:
                      31302386.{" "}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>Colposcopy with biopsy </td>
                  <td>65</td>
                  <td>85</td>
                  <td></td>
                  <td>
                    <p>
                      Brown BH, Tidy JA. The diagnostic accuracy of colposcopy -
                      A review of research methodology and impact on the
                      outcomes of quality assurance. Eur J Obstet Gynecol Reprod
                      Biol. 2019 Sep;240:182-186. doi:
                      10.1016/j.ejogrb.2019.07.003. Epub 2019 Jul 3. PMID:
                      31302386.
                    </p>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
